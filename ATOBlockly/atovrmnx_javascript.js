Blockly.JavaScript['set_train_id'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var number_id = block.getFieldValue('ID');
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.id = ${number_id};\n`;
  return code;
};
Blockly.JavaScript['start_train'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.start(${value_distance});\n`;
  return code;
};

Blockly.JavaScript['stop_train'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.stop(${value_distance});\n`;
  return code;
};

Blockly.JavaScript['turn_train'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.Turn();\n`;
  return code;
};

Blockly.JavaScript['get_train_direction'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.GetDirection()`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['set_train_code'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var number_code = block.getFieldValue('CODE');
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.setCode(${number_code});\n`;
  return code;
};
Blockly.JavaScript['get_train_code'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.code`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['set_train_number'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_number = Blockly.JavaScript.valueToCode(block, 'NUMBER', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.setNumber(${value_number});\n`;
  return code;
};

Blockly.JavaScript['get_train_number'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.number`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['set_train_traveling_voltage'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_voltage = Blockly.JavaScript.valueToCode(block, 'VOLTAGE', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.setVoltage(${value_voltage});\n`;
  return code;
};

Blockly.JavaScript['get_train_voltage'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.GetVoltage()`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['set_point_id'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var number_id = block.getFieldValue('ID');
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.id = ${number_id};\n`;
  return code;
};
Blockly.JavaScript['set_point_branch'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_branch = Blockly.JavaScript.valueToCode(block, 'BRANCH', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.SetBranch(${value_branch});\n`;
  return code;
};

Blockly.JavaScript['switch_point_branch'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.SwitchBranch();\n`;
  return code;
};

Blockly.JavaScript['get_point_branch'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.GetBranch()`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};


Blockly.JavaScript['set_ats_id'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var text_id = block.getFieldValue('ID');
  // TODO: Assemble JavaScript into code variable.
  if (text_id == '') {
    text_id = 'null';
  } else if (text_id.includes(',')) {
    text_id = '[' + text_id + ']';
  }
  var code = `${variable_var}.id = ${text_id};\n`;
  return code;
};

Blockly.JavaScript['catch_event_handler'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var variable_train = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('TRAIN'), Blockly.Variables.NAME_TYPE);
  var statements_statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  // TODO: Assemble JavaScript into code variable.
  let direction = '';
  if (dropdown_direction == 'FORWARD') {
    direction = 'forward';
  } else {
    direction = 'reverse';
  }
  var code = '';
  code += `${variable_var}.${direction} = async function(${variable_train}) {\n`;
  code += statements_statements;
  code += '}\n';
  return code;
};


Blockly.JavaScript['set_platform_atses'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_atsin = Blockly.JavaScript.valueToCode(block, 'ATSIN', Blockly.JavaScript.ORDER_ATOMIC);
  var value_atsout = Blockly.JavaScript.valueToCode(block, 'ATSOUT', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  if (value_atsin == '') {
    value_atsin = 'null';
  }
  if (value_atsout == '') {
    value_atsout = 'null';
  }
  var code = `${variable_var}.atses = [${value_atsin}, ${value_atsout}];\n`;
  return code;
};

Blockly.JavaScript['set_platform_restart'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.restart = ${value_seconds};\n`;
  return code;
};

Blockly.JavaScript['set_platform_train'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_train = Blockly.JavaScript.valueToCode(block, 'TRAIN', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.setTrain(${value_train});\n`;
  return code;
};

Blockly.JavaScript['start_platform'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_train = Blockly.JavaScript.valueToCode(block, 'TRAIN', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.start(${value_train});\n`;
  return code;
};

Blockly.JavaScript['set_platform_codes'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var text_codes = block.getFieldValue('CODES');
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.codes.push(${text_codes});\n`;
  return code;
};

Blockly.JavaScript['set_section_atses'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_atsin = Blockly.JavaScript.valueToCode(block, 'ATSIN', Blockly.JavaScript.ORDER_ATOMIC);
  var value_atsout = Blockly.JavaScript.valueToCode(block, 'ATSOUT', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.atses = [${value_atsin}, ${value_atsout}];\n`;
  return code;
};

Blockly.JavaScript['set_section_train'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_train = Blockly.JavaScript.valueToCode(block, 'TRAIN', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.setTrain(${value_train});\n`;
  return code;
};

Blockly.JavaScript['enter_section'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_train = Blockly.JavaScript.valueToCode(block, 'TRAIN', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.enter(${value_train});\n`;
  return code;
};

Blockly.JavaScript['leave_section'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_train = Blockly.JavaScript.valueToCode(block, 'TRAIN', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await ${variable_var}.leave(${value_train});\n`;
  return code;
};

Blockly.JavaScript['enable_section_log'] = function(block) {
  var variable_var = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // TODO: Assemble JavaScript into code variable.
  var code = `${variable_var}.name = '${variable_var}';\n`;
  return code;
};


Blockly.JavaScript['main_function'] = function(block) {
  var text_address = block.getFieldValue('ADDRESS');
  var statements_statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  // TODO: Assemble JavaScript into code variable.
  var code = '';
  code += 'async function _main() {\n';
  code += `  await _client.connect('${text_address}');\n`;
  code += statements_statements;
  code += '}\n';
  return code;
};

Blockly.JavaScript['sleep_seconds'] = function(block) {
  var value_seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = `await sleep(${value_seconds});\n`;
  return code;
};