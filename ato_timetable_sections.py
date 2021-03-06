import time
import datetime

import schedule

import atovrmnxclient as vc


client = vc.Client()

ats1ii = vc.ATS(client, 79)
ats1Ai = vc.ATS(client, 80)
ats1Ao = vc.ATS(client, 81)
ats1Bi = vc.ATS(client, 82)
ats1Bo = vc.ATS(client, 83)
ats1oo = vc.ATS(client, 84)
ats2ii = vc.ATS(client, 85)
ats2i = vc.ATS(client, 86)
ats2o = vc.ATS(client, 87)
ats2oo = vc.ATS(client, 88)

point1 = vc.Point(client, 73)
point2 = vc.Point(client, 74)

train1 = vc.Train(client, 39)
train2 = vc.Train(client, 40)

platform1A = vc.Platform((ats1Ai, ats1Ao), train=train1)
platform1B = vc.Platform((ats1Bi, ats1Bo), train=train2)
platform2 = vc.Platform((ats2i, ats2o))

section1A = vc.Section((None, ats1oo), train=train1)
section1B = vc.Section((None, ats1oo), train=train2)
section1_2 = vc.Section(((ats1Ao, ats1Bo), ats2i))
section2 = vc.Section((ats2ii, ats2oo))
section2_1 = vc.Section((ats2o, (ats1Ai, ats1Bi)))


def sequence1ii(train):
    if train == train1:
        section1A.enter(train)
        point1.SetBranch(0)
    elif train == train2:
        section1B.enter(train)
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

    basetime = vc.cleartimetable()

    timetabletext = """
列車番号,駅１	,駅２	,駅１	,駅２
A0000	,00:00	,00:40	,01:10
B0015	,00:15	,01:20	,01:50
A0200	,02:00	,02:40	,03:10
B0215	,02:15	,---->	,03:35
"""
    stations = (station1, station2)
    vc.readtimetable(basetime, 4, timetabletext, stations, starttrain)   # 4分間隔で終日分繰り返し登録

    while True:
        schedule.run_pending()
        time.sleep(1)


def main():
    thread = client.connect()

    client.startthread(timetable)

    thread.join()


if __name__ == '__main__':
    main()
