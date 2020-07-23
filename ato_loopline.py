import atovrmnxclient as vc
import time


client = vc.Client()

ats1Bi = vc.ATS(client, 81)
ats1Bo = vc.ATS(client, 83)
ats2i = vc.ATS(client, 86)
ats2o = vc.ATS(client, 87)

point1 = vc.Point(client, 73)
point2 = vc.Point(client, 74)

train2 = vc.Train(client, 40)

platform1B = vc.Platform((ats1Bi, ats1Bo), restart=3)
platform2 = vc.Platform((ats2i, ats2o), restart=3, train=train2)


def main():
    thread = client.connect()

    point1.SetBranch(1)
    point2.SetBranch(1)
    platform2.start()

    thread.join()
    

if __name__ == '__main__':
    main()
