import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import validator from 'validator';
import { extendObservable } from 'mobx';
import { observer } from 'mobx-react';
import styles from './styles.pcss';
import Input from '../Input';
import rules from '../Webform/rules';
import RuleHint from '../RuleHint';
import composeLookUp from '../LookUp';
import WebformUtils from '../WebformUtils';
import FormStore from '../Observables/Form';

@observer
@CSSModules(styles)
class EmailField extends Component {
  static meta = {
    validations: [
      el => rules[`email_${el.key}`],
      el => rules[`email_neverbounce_${el.key}`],
    ],
  };

  static propTypes = {
    field: PropTypes.shape({
      '#webform_key': PropTypes.string.isRequired,
      '#emailError': PropTypes.string,
      '#neverBounceEmail': PropTypes.string,
    }).isRequired,
    webformSettings: PropTypes.shape({
      cmsBaseUrl: PropTypes.string.isRequired,
    }).isRequired,
    getField: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    settings: PropTypes.shape().isRequired,
    formStore: PropTypes.instanceOf(FormStore).isRequired,
  };

  constructor(props) {
    super(props);

    this.lookUpFields = {
      email: {
        formKey: props.field['#webform_key'],
        triggerLookup: true,
        apiValue: () => false,
        required: true,
      },
    };

    const field = props.formStore.getField(props.field['#webform_key']);

    extendObservable(rules, {
      [`email_${props.field['#webform_key']}`]: {
        rule: () => field.isEmpty || validator.isEmail(field.value),
        hint: value =>
          <RuleHint key={`email_${props.field['#webform_key']}`} hint={WebformUtils.getCustomValue(props.field, 'emailError', props.settings) || '":value" isn\'t an Email.'} tokens={{ value }} />,
        shouldValidate: () => field.isBlurred && !field.isEmpty,
      },
      [`email_neverbounce_${props.field['#webform_key']}`]: {
        rule: () => field.isEmpty || field.lookupSuccessful,
        hint: () =>
          <RuleHint key={`email_neverbounce_${props.field['#webform_key']}`} hint={WebformUtils.getCustomValue(props.field, 'neverBounceError', props.settings) || 'This doesn\'t seem to be a valid email address. Please check again.'} />,
        shouldValidate: () => field.isBlurred && !field.isEmpty && validator.isEmail(field.value),
      },
    });

    this.lookUpBase = `${props.webformSettings.cmsBaseUrl}/neverbounce/validate-single?_format=json`;

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(e);
  }

  prepareLookUp(fields) {
    const emailField = this.props.getField('email');

    if(
      !fields.email ||
      !emailField.field ||
      WebformUtils.isEmpty(emailField.field.props, fields.email) ||
      !validator.isEmail(fields.email)
    ) {
      return false;
    }

    const query = `&email=${fields.email}`;

    return {
      query,
      checkResponse: json => (json.success ? json : false),
      isSuccessful: response => response.result !== 1,
    };
  }

  render() {
    return (
      <Input
        {...this.props}
        type='email'
        styleName='email'
        autoComplete='email'
        onBlur={this.props.onBlur}
        onChange={this.onChange}
      />
    );
  }
}

export default composeLookUp(EmailField);
