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


formize.prototype.labelEl = function(name, field) {
	var $label = cheerio.load('<label/>')('label')
	.attr('for', name + '_' + field)
	.text(field);
	return $label;
}

formize.prototype.stringEl = function(name, field, data) {
	if(data === undefined)
		data = '';

	var $input = cheerio.load('<input/>')('input')
	.attr('type', 'text')
	.addClass('form-control')
	.attr('id', name + '_' + field)
	.attr('name', field)
	.val(data);

	var $div = cheerio.load('<div/>')('div')
	.addClass('form-group')
	.append(this.labelEl(name, field))
	.append($input);

	return $div;
}

formize.prototype.textareaEl = function(name, field, data) {
	if(typeof data === 'undefined'){
		data = '';
	}
	
	var $textarea = cheerio.load('<textarea/>')('textarea')
	.addClass('form-control')
	.attr('id', name + '_' + field)
	.attr('name', field)
	.html(data.toString());

	var $div = cheerio.load('<div/>')('div')
	.addClass('form-group')
	.append(this.labelEl(name, field))
	.append($textarea);

	return $div;
}

formize.prototype.numberEl = function(name, field, data) {
	if(data === undefined)
		data = '';
	
	var $input = cheerio.load('<input/>')('input')
	.attr('type', 'number')
	.addClass('form-control')
	.attr('id', name + '_' + field)
	.attr('name', field)
	.val(data);

	var $div = cheerio.load('<div/>')('div')
	.addClass('form-group')
	.append(this.labelEl(name, field))
	.append($input);

	return $div;
}

formize.prototype.DateEl = function(name, field, data) {
	if(data === undefined)
		data = '';
	
	var $input = cheerio.load('<input/>')('input')
	.attr('type', 'datetime-local')
	.addClass('form-control')
	.attr('id', name + '_' + field)
	.attr('name', field)
	.val(data.toUTCString());

	var $div = cheerio.load('<div/>')('div')
	.addClass('form-group')
	.append(this.labelEl(name, field))
	.append($input);

	return $div;
}

formize.prototype.submitButtonEl = function(){
	var $btn = cheerio.load('<input/>')('input')
	.attr('type', 'submit')
	.addClass('btn')
	.addClass('btn-primary')
	.val('Save');
	
	return $btn;
}

formize.prototype.formEl = function(method, action) {
	var $formHolder = cheerio.load('<form/>');

	$formHolder('form').attr('method', method)
	.attr('action', action);

	return $formHolder;
}

formize.prototype.save = function(obj){
	return this.model.create(obj);
}

formize.prototype.generate = function() {
	var fields = this.fields;

	var $formHolder = this.formEl('post', this.endpoint + '/edit/' + instance.id);
	var $form = $formHolder('form');
	
	for(var i in fields) {
		field = fields[i];

		this[field] = this.model.attributes[field];

		switch(this[field].type.key) {
			case ('INTEGER'):
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
	
	return $formHolder;
}

formize.prototype.generateFor = function(instance) {
	var fields = this.fields;

	var $formHolder = this.formEl('post', this.endpoint + '/edit/' + instance.id);
	var $form = $formHolder('form');
	
	for(var i in fields) {
		field = fields[i];

		this[field] = this.model.attributes[field];

		switch(this[field].type.key) {
			case ('INTEGER'):
			this[field].dom = this.numberEl(this.name, field, instance[field]);
			break;
			case ('TEXT'):
			this[field].dom = this.textareaEl(this.name, field, instance[field]);
			break;
			case ('DATE'):
			this[field].dom = this.DateEl(this.name, field, instance[field]);
			break;
			default:
			this[field].dom = this.stringEl(this.name, field, instance[field]);
			break;
		}
		$form.append(this[field].dom);
	}
	$form.append(this.submitButtonEl());
	
	return $formHolder;
}

module.exports = formize;

