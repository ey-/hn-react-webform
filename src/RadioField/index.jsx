import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.pcss';

@CSSModules(styles, { allowMultiple: true })
class RadioField extends React.Component {
  static meta = {
    wrapper: <fieldset role='radiogroup' />,
    label: <legend />,
  };

  getLabelPositionClass() {
    const labelClass = `display-${this.props.field['#title_display']}`;
    if(styles[labelClass]) {
      return labelClass;
    }
    return '';
  }

  getOptionPositionClass() {
    const optionClass = `radio-display-${this.props.field['#options_display']}`;
    if(styles[optionClass]) {
      return optionClass;
    }
    return '';
  }

  render() {
    const cssClassesWrapper = `input-wrapper ${this.getLabelPositionClass()}`;
    const cssClassesRadio = `radio-label ${this.getOptionPositionClass()}`;

    return (
      <div styleName={cssClassesWrapper}>
        {
          /* TODO: radio-options-sidebyside should be loaded from json option #options_display */
          this.props.field && Object.keys(this.props.field['#options']).map((option, index) => {
            const labelKey = `${this.props.field['#webform_key']}_${index}`;
            return <label key={option} styleName={cssClassesRadio} htmlFor={labelKey}>
              <input
                type='radio'
                onChange={this.props.onChange}
                value={option}
                name={this.props.field['#webform_key']}
                styleName='radio'
                id={labelKey}
              />
              <div styleName='indicator' />
              { this.props.field['#options'][option]}
            </label>;
          })
        }
      </div>
    );
  }
}

export default RadioField;
