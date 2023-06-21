import React, { Component } from "react";
import ReactDOM from "react-dom";
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import '../../static/SelectMenu.css';

const Option = (props) => {
  return (
    <div className="custom-option">
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

export default class SelectMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionSelected: null
    };
  }

  handleChange = (selected) => {
    this.setState({
      optionSelected: selected
    });

    // Call the parent component's onChange handler and pass the selected values
    this.props.onChange(selected);
  };

  render() {
    return (
      <span
        className="d-inline-block select-menu-container"
        data-toggle="popover"
        data-trigger="focus"
        data-content="Please select account(s)"
      >
        <ReactSelect
          options={this.props.options}
          isMulti
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          components={{
            Option
          }}
          onChange={this.handleChange}
          allowSelectAll={true}
          value={this.state.optionSelected}
          styles={{
            control: (provided, state) => ({
              ...provided,
              width: "auto",
              minWidth: "15em",
              height: "2em",
              backgroundColor: "#1e1e1e",
              color: "#d63939",
              border: "none",
              borderRadius: "25px",
              margin: "0.5em",
              
            }),
            placeholder: (provided, state) => ({
              ...provided,
               // On Hover:
              color: state.isFocused ? "white" : provided.color,
              // Add any other styles you want to modify for the placeholder
              //Experimental might be removed:
              width: '20vw'
            }),
            menu: (provided, state) => ({
              ...provided,
              width: "auto",
              backgroundColor: "#1e1e1e",
              color: "#858382",
              border: "none",
              borderRadius: "25px",
              paddingBottom: "0.5em",
              margin: "0.5em",
              marginTop: "0", // Remove top margin to align with the control
            }),
            menuList: (provided, state) => ({
              ...provided,
              width: "auto",
              maxHeight: "auto", // Set a maximum height if needed
              overflow: "auto", // Enable scrolling if the menu becomes too long
              color:"blue"
            }),
            option: (provided, state) => ({
              ...provided,
              color: state.isFocused ? "black" : "#858382",
              backgroundColor: state.isFocused ? "#858382" : "transparent",
            }),
            
            multiValue: (provided, state) => ({
              ...provided,
              backgroundColor: "#858382",
              borderRadius: "25px",
            }),
            multiValueLabel: (provided, state) => ({
              ...provided,
              color: "white",
              fontWeight: "bold",
              paddingRight: "6px",
            }),
            multiValueRemove: (provided, state) => ({
              ...provided,
              color: "#ffffff",
              ':hover': {
                backgroundColor: "transparent",
                color: "red",
              },
            }),
            valueContainer: (provided, state) => ({
              ...provided,
              paddingLeft: '6px',
              paddingRight: '6px',
              margin: '-0.3em 0.5em 0em 0em',
            }),
            indicatorsContainer: (provided, state) => ({
              ...provided,
              paddingRight: '6px',
              margin: '-0.2em 0em 0em 0em'
            }),            
          }}
        />
      </span>
    );
  }
}
/*CSS for Styling:
    container: Styles applied to the container element that wraps the entire Select component.
    control: Styles applied to the control element, which is the outer container of the value container and dropdown indicator.
    valueContainer: Styles applied to the container element that wraps the selected value(s).
    input: Styles applied to the input element.
    menu: Styles applied to the dropdown menu container.
    option: Styles applied to each individual option within the dropdown menu.
    placeholder: Styles applied to the placeholder text when no value is selected.
    singleValue: Styles applied to the single selected value in a single-select component.
    multiValue: Styles applied to each selected value in a multi-select component.
    multiValueLabel: Styles applied to the label portion of each selected value in a multi-select component.
    multiValueRemove: Styles applied to the remove button of each selected value in a multi-select component.
    indicatorSeparator: Styles applied to the separator between the control and dropdown indicator.
    dropdownIndicator: Styles applied to the dropdown indicator arrow.
    clearIndicator: Styles applied to the clear indicator (X) button.
    loadingIndicator: Styles applied to the loading indicator spinner.
Source: ChatGPT */