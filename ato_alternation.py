import time

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
platform2 = vc.Platform((ats2i, ats2o), restart=3)


def sequence1ii(train):
    if train == train1:
        point1.SetBranch(0)
    elif train == train2:
        point1.SetBranch(1)


def sequence1Ao(train):
    point2.SetBranch(0)


def sequence1Bo(train):
    point2.SetBranch(1)


def sequence1Ai(train):
    time.sleep(3)
    platform1B.start()


def sequence1Bi(train):
    time.sleep(3)
    platform1A.start()


ats1ii.forward = sequence1ii
ats1Ao.forward = sequence1Ao
ats1Bo.forward = sequence1Bo
ats1Ai.forward = sequence1Ai
ats1Bi.forward = sequence1Bi


def main():
    thread = client.connect()

    platform1A.start()

    thread.join()
    

if __name__ == '__main__':
    main()
