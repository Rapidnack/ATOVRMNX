import time
import datetime

import atovrmnxclient as vc


client = vc.Client()

ats1ii = vc.ATS(client, 79)
ats1Ai = vc.ATS(client, 80)
ats1Ao = vc.ATS(client, 81)
ats1Bi = vc.ATS(client, 82)
ats1Bo = vc.ATS(client, 83)
ats2i = vc.ATS(client, 86)
ats2o = vc.ATS(client, 87)

point1 = vc.Point(client, 73)
point2 = vc.Point(client, 74)

train1 = vc.Train(client, 39)
train2 = vc.Train(client, 40)

platform1A = vc.Platform((ats1Ai, ats1Ao), train=train1)
platform1B = vc.Platform((ats1Bi, ats1Bo), train=train2)
platform2 = vc.Platform((ats2i, ats2o))


def sequence1ii(train):
    if train == train1:
        point1.SetBranch(0)
    elif train == train2:
        point1.SetBranch(1)


def sequence1Ao(train):
    point2.SetBranch(0)


def sequence1Bo(train):
    point2.SetBranch(1)


ats1ii.forward = sequence1ii
ats1Ao.forward = sequence1Ao
ats1Bo.forward = sequence1Bo


def trainnumbertotrain(trainnumber):
    if trainnumber[0] == 'A':
        return train1
    elif trainnumber[0] == 'B':
        return train2
    else:
        return None


station1 = vc.Station('駅１', (platform1A, platform1B), trainnumbertotrain)
station2 = vc.Station('駅２', (platform2,), trainnumbertotrain)


def timetable():

    def starttrain(station, trainnumber):
        t = station.start(trainnumber)
        if t:
            print(f'{datetime.datetime.now()}: [{station.name}]から[{trainnumber}]発車')
        else:
            print(f'{datetime.datetime.now()}: [{station.name}]に[{trainnumber}]不在')

    timetabletext = """
列車番号,駅１	,駅２	,駅１	,駅２
A0000	,00:00	,00:40	,01:10
B0040	,00:40	,01:20	,01:50
A0200	,02:00	,---->	,03:00
B0240	,02:40	,03:20	,03:50
"""

    station1.numbers.extend(('A0000', 'B0040', 'A0200', 'B0240')) # 全て停車
    station2.numbers.extend(('A0000', 'B0040',          'B0240')) # A0200通過

    # 00秒から開始
    now = datetime.datetime.now()
    basetime = (now + datetime.timedelta(minutes=1)).replace(second=0)
    print(f'現在時刻: {now.strftime("%H:%M:%S")}')
    print(f'開始時刻: {basetime.strftime("%H:%M:%S")}')
    print()
    while datetime.datetime.now() < basetime:
        time.sleep(0.1)

    while True:
        starttrain(station1, 'A0000')
        time.sleep(40)
        starttrain(station2, 'A0000')
        starttrain(station1, 'B0040')
        time.sleep(40)
        starttrain(station2, 'B0040')
        time.sleep(40)
        starttrain(station1, 'A0200')
        time.sleep(40)
        # A0200駅２通過
        starttrain(station1, 'B0240')
        time.sleep(40)
        starttrain(station2, 'B0240')
        time.sleep(40)


def main():
    thread = client.connect()

    client.startthread(timetable)

    thread.join()


if __name__ == '__main__':
    main()
