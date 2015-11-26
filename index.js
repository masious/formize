var express = require('express');
var Sequelize = require('sequelize');
var cheerio = require('cheerio');
var router = express.Router();

var formize = function(model) {

	this.model = model;
	this.name = model.name;

	this.allFields = [];
	for(var field in this.model.attributes){
		this.allFields.push(field);
	}

	this.fields = this.fields || this.allFields;
};

formize.prototype.INTEGER 	= JSON.stringify(Sequelize.INTEGER());
formize.prototype.TEXT 		= JSON.stringify(Sequelize.TEXT());
formize.prototype.STRING 		= JSON.stringify(Sequelize.STRING());


formize.prototype.labelEl = function(name, field) {
	var $label = cheerio.load('<label/>');
	$label.attr('for', name + '_' + field);
	$label.text('field');
	return $label;
}

formize.prototype.stringEl = function(name, field, data) {
	if(data === undefined)
		data = '';

	var $input = cheerio.load('<input/>')
	.attr('type', 'text')
	.addClass('form-control')
	.id(name + '_' + field)
	.attr('name', field)
	.val(data);

	var $div = cheerio.load('<div/>')
	.addClas('form-group')
	.append(this.label(name, field))
	.append($input);

	return $div;
}

formize.prototype.textareaEl = function(name, field, data) {
	if(data === undefined)
		data = '';
	
	var $textarea = cheerio.load('<textarea/>')
	.addClass('form-control')
	.id(name + '_' + field)
	.attr('name', field)
	.html(data);

	var $div = cheerio.load('<div/>')
	.addClas('form-group')
	.append(this.label(name, field))
	.append($textarea);

	return $div;
}

formize.prototype.numberEl = function(name, field, data) {
	if(data === undefined)
		data = '';
	
	var $input = cheerio.load('<input/>')
	.attr('type', 'number')
	.addClass('form-control')
	.id(name + '_' + field)
	.attr('name', field)
	.val(data);

	var $div = cheerio.load('<div/>')
	.addClas('form-group')
	.append(this.label(name, field))
	.append($input);

	return $div;
}


formize.prototype.submitButtonEl = function(){
	var $btn = cheerio.load('<button/>')
	.attr('type', 'submit')
	.val('Save')
	.addClass('btn')
	.addClass(btn-primary);
}

formize.prototype.formEl = function(method, action) {
	var $form = cheerio.load('<form/>')
	.attr('method', method)
	.attr('action', action)

	return $form;
}

formize.prototype.save = function(obj){
	return this.model.create(obj);
}

formize.prototype.generate = function() {
	var fields = this.fields;

	var $form = this.formEl('post', this.endpoint + '/new');
	
	for(var i in fields) {
		field = fields[i];

		this[field] = this.model.attributes[field];

		switch(JSON.stringify(this[field].type)) {
			case (this.INTEGER):
			this[field].dom = this.numberEl(this.name, field);
			break;
			case (this.TEXT):
			this[field].dom = this.textareaEl(this.name, field);
			break;
			default:
			this[field].dom = this.stringEl(this.name, field);
			break;
		}
		$form.append(this[field].dom);
	}
	$form.append(this.submitButtonEl());

	return $form;
}

formize.prototype.generateFor = function(instance) {
	var fields = this.fields;

	var $form = this.formEl('post', this.endpoint + '/edit/' + instance.id);
	
	for(var i in fields) {
		field = fields[i];

		this[field] = this.model.attributes[field];

		switch(JSON.stringify(this[field].type)) {
			case (this.INTEGER):
			this[field].dom = this.numberEl(this.name, field);
			break;
			case (this.TEXT):
			this[field].dom = this.textareaEl(this.name, field);
			break;
			default:
			this[field].dom = this.stringEl(this.name, field);
			break;
		}
		$form.append(this[field].dom);
	}
	$form.append(this.submitButtonEl());
	
	return $form;
}

module.exports = formize;

