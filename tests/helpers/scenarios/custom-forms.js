import Ember from 'ember';

Ember.Test.registerAsyncHelper('createCustomFormForType', function(app, assert, formType, alwaysInclude) {
  let crusts =  ['Thin', 'Deep Dish', 'Flatbread'];
  let desserts = ['Ice Cream', 'Cookies', 'Cake'];
  let toppings =  ['Cheese', 'Pepperoni', 'Mushrooms'];
  let header = ['______________________________'];

  function addField(fieldType, label, values) {
    click('button:contains(Add Field)');
    waitToAppear('.modal-dialog');
    andThen(function() {
      if (assert) {
        assert.equal(find('.modal-title').text(), 'Add Value', 'Add Value modal displays.');
      }

      select('.custom-field-select', fieldType);
      fillIn('.custom-field-label input', label);
      fillIn('.custom-field-colspan input', '1');
    });
    if (values) {
      if (assert) {
        click('button:contains(Add Value)');
        andThen(function() {
          fillIn('.custom-field-value:last', 'Delete Me');
        });
        andThen(function() {
          assert.equal(find('.custom-field-value:contains(Delete Me)').length, 0, 'Field value successfully added');
          click('button.delete-field-value');
        });
        andThen(function() {
          assert.equal(find('.custom-field-value:contains(Delete Me)').length, 0, 'Field value successfully deleted');
        });
      }
      andThen(function() {
        values.forEach(function(value) {
          click('button:contains(Add Value)');
          andThen(function() {
            fillIn('.custom-field-value:last', value);
          });
        });
      });
    }
    andThen(function() {
      click('.modal-footer button:contains(Add)');
    });
  }

  visit('/admin/custom-forms');
  click('button:contains(new form)');
  andThen(function() {
    if (assert) {
      assert.equal(find('.view-current-title').text(), 'New Custom Form', 'New custom form edit page displays');
      assert.equal(currentURL(), '/admin/custom-forms/edit/new', 'Navigated to create new custom form');
    }

    fillIn('.custom-form-name input', `Test Custom Form for ${formType} (${alwaysInclude ? '' : 'NOT '}included)`);
    fillIn('.custom-form-columns input', '2');
    select('.custom-form-type', formType);
    if (alwaysInclude) {
      click('.js-custom-form-always-include input');
    }
    click('.panel-footer button:contains(Add)');
    waitToAppear('.modal-dialog');
  });
  andThen(function() {
    if (assert) {
      assert.equal(find('.modal-title').text(), 'Form Saved', 'Form is saved');
    }

    click('.modal-footer button:contains(Ok)');
    addField('Header', 'Create a Pizza', header);
  });
  andThen(function() {
    addField('Checkbox', 'Pizza Toppings', toppings);
  });
  andThen(function() {
    addField('Dropdown', 'Pizza Crust', crusts);
  });
  andThen(function() {
    addField('Radio', 'Dessert', desserts);
  });
  andThen(function() {
    addField('Text', 'Beverage');
  });
  andThen(function() {
    addField('Large Text', 'Special Instructions');
  });
  andThen(function() {
    click('button:contains(Update)');
    waitToAppear('.modal-dialog');
  });
  andThen(function() {
    if (assert) {
      assert.equal(find('.modal-title').text(), 'Form Saved', 'Form is updated');
    }

    click('.modal-footer button:contains(Ok)');
  });
});

Ember.Test.registerAsyncHelper('checkCustomFormIsDisplayed', function(app, assert, header) {
  waitToAppear(`h4:contains(${header})`);

  andThen(() => {
    assert.equal(find(`h4:contains(${header})`).length, 1, `Form ${header} is displayed`);

    let formDiv = find(`h4:contains(${header}) + .js-custom-form`);

    assert.equal(find('label:contains(Form Header)', formDiv).length, 1, 'There is a form header');

    assert.equal(find('label:contains(Form Dropdown)', formDiv).length, 1, 'There is a dropdown header');
    assert.equal(find('select', formDiv).length, 1, 'There is a dropdown');
    assert.equal(find('option', formDiv).length, 2, 'There are options');

    assert.equal(find('label:contains(Form Checkbox)', formDiv).length, 1, 'There is a checkbox header');
    assert.equal(find('input[type=checkbox]', formDiv).length, 2, 'There are checkboxes');

    assert.equal(find('label:contains(Form large text)', formDiv).length, 1, 'There is a textarea header');
    assert.equal(find('textarea', formDiv).length, 1, 'There is a textarea');

    assert.equal(find('label:contains(Form radio)', formDiv).length, 1, 'There is a radio header');
    assert.equal(find('input[type=radio]', formDiv).length, 3, 'There are radios');
    assert.equal(find('label:contains(other option)', formDiv).length, 1, 'There is the other option radio');
    assert.equal(find('label:contains(other option) input[type=text]', formDiv).length, 1, 'There is the other option input');

    assert.equal(find('label:contains(Form simple text)', formDiv).length, 1, 'There is a text header');
    assert.equal(find('label:contains(Form simple text)+input[type=text]', formDiv).length, 1, 'There is a text input');
  });
});

Ember.Test.registerAsyncHelper('fillCustomForm', function(app, header) {
  let formSelector = `h4:contains(${header}) + .js-custom-form`;
  select(`${formSelector} select`, 'Value 2');
  click(`${formSelector} input[type=checkbox]:last`);
  click(`${formSelector} input[type=radio]:nth(1)`);
  fillIn(`${formSelector} textarea`, `Large text for the form ${header}`);
  fillIn(`${formSelector} label:contains(Form simple text)+input[type=text]`, `Small text for the form ${header}`);
});

Ember.Test.registerAsyncHelper('checkCustomFormIsFilled', function(app, assert, header) {
  waitToAppear(`h4:contains(${header})`);

  andThen(() => {
    let formDiv = find(`h4:contains(${header}) + .js-custom-form`);

    assert.equal(find('label:contains(Form Header)', formDiv).length, 1, 'There is a form header');
    assert.equal(find('select', formDiv).val(), 'Value 2', 'There is value in select');
    assert.ok(find('input[type=checkbox]:last', formDiv).is(':checked'), 'There is value in checkbox');
    assert.equal(find('input:radio:checked', formDiv).val(), 'radio 2', 'There is value in radio');
    assert.equal(find('textarea', formDiv).val(), `Large text for the form ${header}`, 'There is value in textarea');
    assert.equal(find('label:contains(Form simple text)+input[type=text]', formDiv).val(), `Small text for the form ${header}`, 'There is value in the input');
  });
});

Ember.Test.registerAsyncHelper('checkCustomFormIsFilledAndReadonly', function(app, assert, header) {
  waitToAppear(`h4:contains(${header})`);

  andThen(() => {
    let formDiv = find(`h4:contains(${header}) + .js-custom-form`);

    assert.equal(find('label:contains(Form Header)', formDiv).length, 1, 'There is a form header');
    assert.equal(find('p:contains(Value 2)', formDiv).length, 1, 'There is text from select');
    assert.equal(find('p:contains(radio 2)', formDiv).length, 1, 'There is text from radio');
    assert.ok(find('input[type=checkbox]:last', formDiv).is(':checked'), 'There is value in checkbox');
    assert.equal(find(`p:contains(Large text for the form ${header})`, formDiv).length, 1, 'There is text from textarea');
    assert.equal(find(`p:contains(Small text for the form ${header})`, formDiv).length, 1, 'There is text from input');
  });
});
