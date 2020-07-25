"""VRM-NXにサーバー機能を追加するサーバーモジュール

１．Python3.7をインストールしてください。
    インストール場所に合わせてソースコード内のモジュール検索パスを変更してください。
        sys.path.append("C:\Python37\Lib")
        sys.path.append("C:\Python37\DLLs")
        sys.path.append("C:\Python37\Lib\site-packages")
    （動作確認にはVRM-NXと同じPython3.7.3を使用しました。）

２．次の２つのファイルをレイアウトファイルと同じフォルダーに配置してください。
    atovrmnxparser.py
    atovrmnxserver.py（このモジュール）

３．レイアウトのスクリプトに、このモジュールを呼び出すコードを追加してください。
    #LAYOUT
    import vrmapi
    import atovrmnxserver                                     <=== 追加

    def vrmevent_serverats(obj,ev,param):                     <=== 追加
        if ev == 'catch':                                     <=== 追加
            atovrmnxserver.process_ats_event(obj,ev,param)    <=== 追加

    def vrmevent(obj,ev,param):
        if ev == 'init':
            dummy = 1
        elif ev == 'broadcast':
            dummy = 1
        elif ev == 'timer':
            dummy = 1
        elif ev == 'time':
            dummy = 1
        elif ev == 'after':
            dummy = 1
        elif ev == 'frame':
            atovrmnxserver.process_layout_event(obj,ev,param) <=== 追加
        elif ev == 'keydown':
            dummy = 1

３．ビュワーの表示中、クライアントからの接続要求を受け付けます。
    コマンド用TCPポート番号54001
    イベント用TCPポート番号54002

４．クライアントから送られてくる'\n'で終端したコマンド文字列を受信すると、
    atovrmnxparserモジュールが解釈してvrmapiモジュールのAPIを実行します。
    例:
        'SetVoltage(0.5)\n' アクティブ列車対象
        'Turn()\n' アクティブ列車対象
        'LAYOUT().GetTrain(39).AutoSpeedCTRL(400, 0.5)\n'
        'LAYOUT().GetPoint(73).SetBranch(1)\n'
    実行できるAPIは、atovrmnxparserモジュールに処理を記述してある走行関連のものだけです。
    他のAPIもクライアントから実行したい場合はatovrmnxparserモジュールに処理を追加してください。

５．catchイベントは'\n'で終端した文字列に変換されてクライアントに送信されます。
    例:
        'catch 79 40 1 1\n' 内容: VRMATS[79]、VRMTrain[40]、順方向、先頭車輪
"""
import sys
sys.path.append("C:\Python37\Lib")
sys.path.append("C:\Python37\DLLs")
sys.path.append("C:\Python37\Lib\site-packages")
import socket

import vrmapi

import atovrmnxparser


_commandsocketaddress = ('0.0.0.0', 54001) # コマンド用
_eventsocketaddress = ('0.0.0.0', 54002) # イベント用

# ノンブロッキングモードのコマンド用ソケットを用意して接続受付開始
_servercommandsocket = socket.socket()
_servercommandsocket.setblocking(False)
_servercommandsocket.bind(_commandsocketaddress)
_servercommandsocket.listen(1)
_clientcommandsocket = None
_clientcommandstream = None

# ノンブロッキングモードのイベント用ソケットを用意して接続受付開始
_servereventsocket = socket.socket()
_servereventsocket.setblocking(False)
_servereventsocket.bind(_eventsocketaddress)
_servereventsocket.listen(1)
_clienteventsocket = None
_clienteventstream = None

# VRM-NXにframeイベントの発生を依頼
vrmapi.LAYOUT().SetEventFrame()

vrmapi.LOG(f'{__name__} : ### Startup ###')


def _closecommandsocket():
    global _clientcommandsocket, _clientcommandstream

    if _clientcommandsocket:
        _clientcommandsocket.close()
        _clientcommandsocket = None
        _clientcommandstream = None


def _closeeventsocket():
    global _clienteventsocket, _clienteventstream

    if _clienteventsocket:
        _clienteventsocket.close()
        _clienteventsocket = None
        _clienteventstream = None


def process_ats_event(obj, ev, param):
    """catchイベントを文字列にしてクライアントに送信する。

    VRM-NXのレイアウトスクリプトに記述したvrmevent_userats()から呼ばれる。
    """
    global _clienteventsocket, _clienteventstream

    if ev == 'catch':
        # catchイベントを文字列にしてクライアントに送る。
        s = f'catch {obj.GetID()} {param["trainid"]} {param["dir"]} {param["tire"]}\n'
        #vrmapi.LOG(s)
        if _clienteventstream:
            try:
                _clienteventstream.write(s)
                _clienteventstream.flush()
            except Exception as e:
                vrmapi.LOG(f'eventsocket write: {e}')
                _closeeventsocket()


def process_layout_event(obj, ev, param):
    """frameイベントのたびにクライアントからの接続要求とコマンド文字列を処理する。

    VRM-NXのレイアウトスクリプトに記述したvrmevent()から呼ばれる。

    """
    global _servercommandsocket, _clientcommandsocket, _clientcommandstream
    global _servereventsocket, _clienteventsocket, _clienteventstream

    if ev == 'frame':
        # コマンド用ソケットへの接続を受け付ける。
        # 接続要求が無いときはBlockingIOError発生で次の処理に進む。
        try:
            newclientsocket, (address, port) = _servercommandsocket.accept()
            vrmapi.LOG(f'commandsocket: {address}:{port}')
            _closecommandsocket()
            _clientcommandsocket = newclientsocket
            _clientcommandstream = _clientcommandsocket.makefile(mode='rw')
        except (BlockingIOError, socket.error):
            pass
        # イベント用ソケットへの接続を受け付ける。
        # 接続要求が無いときはBlockingIOError発生で次の処理に進む。
        try:
            newclientsocket1, (address, port) = _servereventsocket.accept()
            vrmapi.LOG(f'eventsocket: {address}:{port}')
            _closeeventsocket()
            _clienteventsocket = newclientsocket1
            _clienteventstream = _clienteventsocket.makefile(mode='rw')
        except (BlockingIOError, socket.error):
            pass

        # コマンド用ソケットからコマンドを読み込んでパーサーに渡す。
        # 受信バッファーにコマンドが無いときは次の処理に進む。
        if _clientcommandstream:
            try:
                while True:
                    command = _clientcommandstream.readline().rstrip()
                    if not command:
                        break
                    #vrmapi.LOG(f'command:{command}')

                    response = None
                    try:
                        response = atovrmnxparser.execvrmapi(command)
                    except Exception as e:
                        vrmapi.LOG(f'execvrmapi("{command}"): {e}')

                    if response:
                        #vrmapi.LOG(f'response:{response}')
                        try:
                            _clientcommandstream.write(f'{response}\n')
                            _clientcommandstream.flush()
                        except Exception as e:
                            vrmapi.LOG(f'commandsocket write: {e}')
                            _closecommandsocket()
            except Exception as e:
                vrmapi.LOG(f'commandsocket read: {e}')
                _closecommandsocket()
