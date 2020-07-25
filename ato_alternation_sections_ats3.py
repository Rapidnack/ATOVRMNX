import time

import atovrmnxclient as vc


client = vc.Client()

ats1ii = vc.ATS(client, (79, 89, 99))
ats1Ai = vc.ATS(client, (80, 90, 100))
ats1Ao = vc.ATS(client, (81, 91, 101))
ats1Bi = vc.ATS(client, (82, 92, 102))
ats1Bo = vc.ATS(client, (83, 93, 103))
ats1oo = vc.ATS(client, (84, 94, 104))
ats2ii = vc.ATS(client, (85, 95, 105))
ats2i = vc.ATS(client, (86, 96, 106))
ats2o = vc.ATS(client, (87, 97, 107))
ats2oo = vc.ATS(client, (88, 98, 108))

point1 = vc.Point(client, 73)
point2 = vc.Point(client, 74)

train1 = vc.Train(client, 39)
train2 = vc.Train(client, 40)

platform1A = vc.Platform((ats1Ai, ats1Ao), train=train1)
platform1B = vc.Platform((ats1Bi, ats1Bo), train=train2)
platform2 = vc.Platform((ats2i, ats2o), restart=3)

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


def sequence1Ai(train):
    time.sleep(3)
    platform1B.start()
    time.sleep(10)
    platform1A.start()


ats1ii.forward = sequence1ii
ats1Ao.forward = sequence1Ao
ats1Bo.forward = sequence1Bo
ats1Ai.forward = sequence1Ai


def main():
    thread = client.connect()

    platform1A.start()

    thread.join()


if __name__ == '__main__':
    main()
