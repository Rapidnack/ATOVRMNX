import atovrmnxclient as vc
import time
import datetime
import schedule


client = vc.Client()

ats1ii = vc.ATS(client, (79, 89, 99))
ats1Ai = vc.ATS(client, (80, 90, 100))
ats1Bi = vc.ATS(client, (81, 91, 101))
ats1Ao = vc.ATS(client, (82, 92, 102))
ats1Bo = vc.ATS(client, (83, 93, 103))
ats2i = vc.ATS(client, (86, 96, 106))
ats2o = vc.ATS(client, (87, 97, 107))

point1 = vc.Point(client, 73)
point2 = vc.Point(client, 74)

train1 = vc.Train(client, 39)
train2 = vc.Train(client, 40)

platform1A = vc.Platform((ats1Ai, ats1Ao), train=train1)
platform1B = vc.Platform((ats1Bi, ats1Bo))
platform2 = vc.Platform((ats2i, ats2o), train=train2)


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

    basetime = vc.cleartimetable()
    
    timetabletext = """
列車番号,駅１	,駅２	,駅１	,駅２	
A0000	,00:00	,00:40	,01:00
B0000	,	,00:00	,01:20	,01:50
A0200	,02:00	,---->	,03:10
B0200	,      	,02:00	,03:20	,03:50
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
