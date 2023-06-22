import React, { Component } from "react";
import ReactDOM, { render } from "react-dom";
import '../../static/SelectMenu.css';
import Multiselect from 'multiselect-react-dropdown';

function SelectMenu(){

return render(
    <Multiselect
        options={this.props.options} // Options to display in the dropdown
        selectedValues={this.state.selectedValue} // Preselected value to persist in dropdown
        onSelect={this.onSelect} // Function will trigger on select event
        onRemove={this.onRemove} // Function will trigger on remove event
        displayValue="name" // Property name to display in the dropdown options
    />)

}

export default SelectMenu;
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
    indicatorsContainer:
Source: ChatGPT */