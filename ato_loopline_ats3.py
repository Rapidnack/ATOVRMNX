import atovrmnxclient as vc


client = vc.Client()

ats1Ai = vc.ATS(client, (80, 90, 100))
ats1Ao = vc.ATS(client, (81, 91, 101))
ats2i = vc.ATS(client, (86, 96, 106))
ats2o = vc.ATS(client, (87, 97, 107))

train1 = vc.Train(client, 39)

platform1A = vc.Platform((ats1Ai, ats1Ao), restart=3, train=train1)
platform2 = vc.Platform((ats2i, ats2o), restart=3)


def main():
    thread = client.connect()

    platform1A.start()

    thread.join()
    

if __name__ == '__main__':
    main()
