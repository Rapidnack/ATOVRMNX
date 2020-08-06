function registerMyFlyouts(workspace) {
  workspace.registerButtonCallback("createTrainButtonPressed", function(button) {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, 'Train');
  });

  workspace.registerButtonCallback("createPointButtonPressed", function(button) {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, 'Point');
  });

  workspace.registerButtonCallback("createATSButtonPressed", function(button) {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, 'ATS');
  });

  workspace.registerButtonCallback("createPlatformButtonPressed", function(button) {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, 'Platform');
  });

  workspace.registerButtonCallback("createSectionButtonPressed", function(button) {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(), null, 'Section');
  });

  workspace.registerToolboxCategoryCallback('TRAIN', function() {
    var xmlList = [];

    var blockText = '<button text="列車の作成…" callbackKey="createTrainButtonPressed"></button>';
    var block = Blockly.Xml.textToDom(blockText);
    xmlList.push(block);

    var variableModelList = workspace.getVariablesOfType('Train');

    if (variableModelList.length > 2) { // ATSイベントハンドラの引数'列車'と'train'を除外
      var lastVariable = variableModelList[variableModelList.length - 1];

      var typeList = ['set_train_id', 'start_train', 'stop_train', 'turn_train', 'get_train_direction', 'set_train_code', 'get_train_code', 'set_train_number', 'get_train_number', 'set_train_traveling_voltage', 'get_train_voltage'];
      for (var type of typeList) {
        if (type == 'start_train') {
          blockText =
            '<block type="start_train">\n' +
            '  <value name="DISTANCE">\n' +
            '    <shadow type="math_number">\n' +
            '      <field name="NUM">400</field>\n' +
            '    </shadow>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else if (type == 'stop_train') {
          blockText =
            '<block type="stop_train">\n' +
            '  <value name="DISTANCE">\n' +
            '    <shadow type="math_number">\n' +
            '      <field name="NUM">550</field>\n' +
            '    </shadow>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else if (type == 'set_train_number') {
          blockText =
            '<block type="set_train_number">\n' +
            '  <value name="NUMBER">\n' +
            '    <shadow type="text">\n' +
            '      <field name="TEXT"></field>\n' +
            '    </shadow>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else if (type == 'set_train_traveling_voltage') {
          blockText =
            '<block type="set_train_traveling_voltage">\n' +
            '  <value name="VOLTAGE">\n' +
            '    <shadow type="math_number">\n' +
            '      <field name="NUM">0.5</field>\n' +
            '    </shadow>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else {
          block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', type);
        }
        block.appendChild(Blockly.Variables.generateVariableFieldDom(lastVariable));
        xmlList.push(block);
      }
    }

    if (variableModelList.length > 0) {
      if (Blockly.Blocks['variables_get_dynamic']) {
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (var i = 0, variable; (variable = variableModelList[i]); i++) {
          var block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', 'variables_get_dynamic');
          block.setAttribute('gap', 8);
          block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
          xmlList.push(block);
        }
      }
    }

    return xmlList;
  });

  workspace.registerToolboxCategoryCallback('POINT', function() {
    var xmlList = [];

    var blockText = '<button text="ポイントの作成…" callbackKey="createPointButtonPressed"></button>';
    var block = Blockly.Xml.textToDom(blockText);
    xmlList.push(block);

    var variableModelList = workspace.getVariablesOfType('Point');

    if (variableModelList.length > 0) {
      var lastVariable = variableModelList[variableModelList.length - 1];

      var typeList = ['set_point_id', 'set_point_branch', 'switch_point_branch', 'get_point_branch'];
      for (var type of typeList) {
        if (type == 'set_point_branch') {
          blockText =
            '<block type="set_point_branch">\n' +
            '  <value name="BRANCH">\n' +
            '    <shadow type="math_number">\n' +
            '      <field name="NUM">0</field>\n' +
            '    </shadow>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else {
          block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', type);
        }
        block.appendChild(Blockly.Variables.generateVariableFieldDom(lastVariable));
        xmlList.push(block);
      }
    }

    if (variableModelList.length > 0) {
      if (Blockly.Blocks['variables_get_dynamic']) {
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (var i = 0, variable; (variable = variableModelList[i]); i++) {
          var block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', 'variables_get_dynamic');
          block.setAttribute('gap', 8);
          block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
          xmlList.push(block);
        }
      }
    }

    return xmlList;
  });

  workspace.registerToolboxCategoryCallback('ATS', function() {
    var xmlList = [];

    var blockText = '<button text="ATSの作成…" callbackKey="createATSButtonPressed"></button>';
    var block = Blockly.Xml.textToDom(blockText);
    xmlList.push(block);

    var variableModelList = workspace.getVariablesOfType('ATS');

    if (variableModelList.length > 0) {
      var lastVariable = variableModelList[variableModelList.length - 1];

      var typeList = ['set_ats_id', 'catch_event_handler'];
      for (var type of typeList) {
        block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', type);
        block.appendChild(Blockly.Variables.generateVariableFieldDom(lastVariable));
        xmlList.push(block);
      }
    }

    if (variableModelList.length > 0) {
      if (Blockly.Blocks['variables_get_dynamic']) {
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (var i = 0, variable; (variable = variableModelList[i]); i++) {
          var block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', 'variables_get_dynamic');
          block.setAttribute('gap', 8);
          block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
          xmlList.push(block);
        }
      }
    }

    return xmlList;
  });

  workspace.registerToolboxCategoryCallback('PLATFORM', function() {
    var xmlList = [];

    var blockText = '<button text="プラットホームの作成…" callbackKey="createPlatformButtonPressed"></button>';
    var block = Blockly.Xml.textToDom(blockText);
    xmlList.push(block);

    var variableModelList = workspace.getVariablesOfType('Platform');

    if (variableModelList.length > 0) {
      var lastVariable = variableModelList[variableModelList.length - 1];

      var typeList = ['set_platform_atses', 'set_platform_restart', 'set_platform_train', 'start_platform', 'set_platform_codes'];
      for (var type of typeList) {
        if (type == 'set_platform_restart') {
          blockText =
            '<block type="set_platform_restart">\n' +
            '  <value name="SECONDS">\n' +
            '    <shadow type="math_number">\n' +
            '      <field name="NUM">3</field>\n' +
            '    </shadow>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else {
          block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', type);
        }
        block.appendChild(Blockly.Variables.generateVariableFieldDom(lastVariable));
        xmlList.push(block);
      }
    }

    if (variableModelList.length > 0) {
      if (Blockly.Blocks['variables_get_dynamic']) {
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (var i = 0, variable; (variable = variableModelList[i]); i++) {
          var block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', 'variables_get_dynamic');
          block.setAttribute('gap', 8);
          block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
          xmlList.push(block);
        }
      }
    }

    return xmlList;
  });

  workspace.registerToolboxCategoryCallback('SECTION', function() {
    var xmlList = [];

    var blockText = '<button text="閉塞区間の作成…" callbackKey="createSectionButtonPressed"></button>';
    var block = Blockly.Xml.textToDom(blockText);
    xmlList.push(block);

    var variableModelList = workspace.getVariablesOfType('Section');

    if (variableModelList.length > 0) {
      var lastVariable = variableModelList[variableModelList.length - 1];

      var typeList = ['set_section_atses', 'set_section_train', 'enter_section', 'leave_section', 'enable_section_log'];
      for (var type of typeList) {
        if (type == 'set_section_atses') {
          blockText =
            '<block type="set_section_atses">\n' +
            '  <value name="ATSIN">\n' +
            '    <block type="lists_create_with">\n' +
            '      <mutation items="1"></mutation>\n' +
            '    </block>\n' +
            '  </value>\n' +
            '  <value name="ATSOUT">\n' +
            '    <block type="lists_create_with">\n' +
            '      <mutation items="1"></mutation>\n' +
            '    </block>\n' +
            '  </value>\n' +
            '</block>';
          block = Blockly.Xml.textToDom(blockText);
        } else {
          block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', type);
        }
        block.appendChild(Blockly.Variables.generateVariableFieldDom(lastVariable));
        xmlList.push(block);
      }
    }

    if (variableModelList.length > 0) {
      if (Blockly.Blocks['variables_get_dynamic']) {
        variableModelList.sort(Blockly.VariableModel.compareByName);
        for (var i = 0, variable; (variable = variableModelList[i]); i++) {
          var block = Blockly.utils.xml.createElement('block');
          block.setAttribute('type', 'variables_get_dynamic');
          block.setAttribute('gap', 8);
          block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
          xmlList.push(block);
        }
      }
    }

    return xmlList;
  });
}
