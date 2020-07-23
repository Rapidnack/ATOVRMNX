"""atovrmnxparserモジュールから呼ばれるコマンド処理モジュール"""
import vrmapi
import re


# '*****(***)'タイプのコマンドを探すパターン
_pat1 = re.compile(r'^([A-Za-z]+)\((.*)\)$')
# '*****(***).*****(***)'タイプのコマンドを探すパターン
_pat2 = re.compile(r'^([A-Za-z]+)\((.*)\)\.([A-Za-z]+)\((.*)\)$')
# '*****(***).*****(***).*****(***)'タイプのコマンドを探すパターン
_pat3 = re.compile(r'^([A-Za-z]+)\((.*)\)\.([A-Za-z]+)\((.*)\)\.([A-Za-z]+)\((.*)\)$')
# '*****(***).*****(***).*****(***).*****(***)'タイプのコマンドを探すパターン
_pat4 = re.compile(r'^([A-Za-z]+)\((.*)\)\.([A-Za-z]+)\((.*)\)\.([A-Za-z]+)\((.*)\)\.([A-Za-z]+)\((.*)\)$')


def _activetrain():
    """現在アクティブなVRMTrainオブジェクトを返す。"""
    lst = [x for x in vrmapi.LAYOUT().GetTrainList() if x.IsActive()]
    if lst:
        return lst[0]
    return None


def execvrmapi(command):
    """コマンド文字列を解釈し、vrmapiのメソッドを呼ぶ。
    パターンに'.*'が含まれるので長いパターンから短いパターンの順に探す。
    値を返すコマンドのときはvrmapiのメソッドの戻り値を文字列にして返す。
    """
    m = _pat4.search(command)
    if m:
        cmd = f'{m.group(1)}().{m.group(3)}().{m.group(5)}().{m.group(7)}()'
        
        vrmapi.LOG(f'サーバー未実装: {command}')
        return None

    m = _pat3.search(command)
    if m:
        cmd = f'{m.group(1)}().{m.group(3)}().{m.group(5)}()'

        if cmd == 'LAYOUT().GetATS().ClearUserEventFunction()':
            if m.group(2) != '': return None
            ats = int(m.group(4))
            if m.group(6) != '': return None
            vrmapi.LAYOUT().GetATS(ats).ClearUserEventFunction()
            return None

        elif cmd == 'LAYOUT().GetATS().SetUserEventFunction()':
            if m.group(2) != '': return None
            ats = int(m.group(4))
            name = m.group(6)[1:-1]
            vrmapi.LAYOUT().GetATS(ats).SetUserEventFunction(name)
            return None

        elif cmd == 'LAYOUT().GetPoint().GetBranch()':
            if m.group(2) != '': return ''
            point = int(m.group(4))
            if m.group(6) != '': return ''
            return str(vrmapi.LAYOUT().GetPoint(point).GetBranch())

        elif cmd == 'LAYOUT().GetPoint().SetBranch()':
            if m.group(2) != '': return None
            point = int(m.group(4))
            branch = int(m.group(6))
            vrmapi.LAYOUT().GetPoint(point).SetBranch(branch)    
            return None

        elif cmd == 'LAYOUT().GetPoint().SwitchBranch()':
            if m.group(2) != '': return None
            point = int(m.group(4))
            if m.group(6) != '': return None
            vrmapi.LAYOUT().GetPoint(point).SwitchBranch()    
            return None

        elif cmd == 'LAYOUT().GetTrain().AutoSpeedCTRL()':
            if m.group(2) != '': return None
            train = int(m.group(4))
            lst = m.group(6).split(',')
            distance = float(lst[0].strip())
            voltage = float(lst[1].strip())
            vrmapi.LAYOUT().GetTrain(train).AutoSpeedCTRL(distance, voltage)    
            return None

        elif cmd == 'LAYOUT().GetTrain().GetDirection()':
            if m.group(2) != '': return ''
            train = int(m.group(4))
            if m.group(6) != '': return ''
            return str(vrmapi.LAYOUT().GetTrain(train).GetDirection())

        elif cmd == 'LAYOUT().GetTrain().GetVoltage()':
            if m.group(2) != '': return ''
            train = int(m.group(4))
            if m.group(6) != '': return ''
            return str(vrmapi.LAYOUT().GetTrain(train).GetVoltage())

        elif cmd == 'LAYOUT().GetTrain().SetTimerVoltage()':
            if m.group(2) != '': return None
            train = int(m.group(4))
            lst = m.group(6).split(',')
            sec = float(lst[0].strip())
            voltage = float(lst[1].strip())
            vrmapi.LAYOUT().GetTrain(train).SetTimerVoltage(sec, voltage)    
            return None

        elif cmd == 'LAYOUT().GetTrain().SetTrainCode()':
            if m.group(2) != '': return None
            train = int(m.group(4))
            code = int(m.group(6))
            vrmapi.LAYOUT().GetTrain(train).SetTrainCode(code)    
            return None

        elif cmd == 'LAYOUT().GetTrain().SetTrainNumber()':
            if m.group(2) != '': return None
            train = int(m.group(4))
            number = m.group(6)[1:-1]
            vrmapi.LAYOUT().GetTrain(train).SetTrainNumber(number)    
            return None

        elif cmd == 'LAYOUT().GetTrain().SetVoltage()':
            if m.group(2) != '': return None
            train = int(m.group(4))
            voltage = float(m.group(6))
            vrmapi.LAYOUT().GetTrain(train).SetVoltage(voltage)    
            return None

        elif cmd == 'LAYOUT().GetTrain().Turn()':
            if m.group(2) != '': return None
            train = int(m.group(4))
            if m.group(6) != '': return None
            vrmapi.LAYOUT().GetTrain(train).Turn()    
            return None

        vrmapi.LOG(f'サーバー未実装: {command}')
        return None

    m = _pat2.search(command)
    if m:
        cmd = f'{m.group(1)}().{m.group(3)}()'
        
        vrmapi.LOG(f'サーバー未実装: {command}')
        return None

    m = _pat1.search(command)
    if m:
        cmd = f'{m.group(1)}()'

        if cmd == 'AutoSpeedCTRL()':
            lst = m.group(2).split(',')
            distance = float(lst[0].strip())
            voltage = float(lst[1].strip())
            train = _activetrain()
            if train is None: return None
            train.AutoSpeedCTRL(distance, voltage)    
            return None

        elif cmd == 'GetDirection()':
            if m.group(2) != '': return ''
            train = _activetrain()
            if train is None: return ''
            return str(train.GetDirection())

        elif cmd == 'GetVoltage()':
            if m.group(2) != '': return ''
            train = _activetrain()
            if train is None: return ''
            return str(train.GetVoltage())

        elif cmd == 'GetID()':
            if m.group(2) != '': return ''
            train = _activetrain()
            if train is None: return ''
            return str(train.GetID())

        elif cmd == 'SetTimerVoltage()':
            lst = m.group(2).split(',')
            sec = float(lst[0].strip())
            voltage = float(lst[1].strip())
            train = _activetrain()
            if train is None: return None
            train.SetTimerVoltage(sec, voltage)    
            return None

        elif cmd == 'SetVoltage()':
            voltage = float(m.group(2))
            train = _activetrain()
            if train is None: return None
            train.SetVoltage(voltage)    
            return None

        elif cmd == 'Turn()':
            if m.group(2) != '': return None
            train = _activetrain()
            if train is None: return None
            train.Turn()    
            return None

        vrmapi.LOG(f'サーバー未実装: {command}')
        return None
