/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2018, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define([], function () {

    function DisplayLayoutToolbar(openmct) {
        return {
            name: "Display Layout Toolbar",
            key: "layout",
            description: "A toolbar for objects inside a display layout.",
            forSelection: function (selection) {
                // Apply the layout toolbar if the edit mode is on, and the selected object
                // is inside a layout, or the main layout is selected.
                return (openmct.editor.isEditing() && selection &&
                    ((selection[1] && selection[1].context.item && selection[1].context.item.type === 'layout') ||
                    (selection[0].context.item && selection[0].context.item.type === 'layout')));
            },
            toolbar: function (selection) {
                const DIALOG_FORM = {
                    'text': {
                        name: "Text Element Properties",
                        sections: [
                            {
                                rows: [
                                    {
                                        key: "text",
                                        control: "textfield",
                                        name: "Text",
                                        required: true
                                    }
                                ]
                            }
                        ]
                    },
                    'image': {
                        name: "Image Properties",
                        sections: [
                            {
                                rows: [
                                    {
                                        key: "url",
                                        control: "textfield",
                                        name: "Image URL",
                                        "cssClass": "l-input-lg",
                                        required: true
                                    }
                                ]
                            }
                        ]
                    }
                };

                function getUserInput(form) {
                    return openmct.$injector.get('dialogService').getUserInput(form, {});
                }

                let selectedParent = selection[1] && selection[1].context.item,
                    selectedObject = selection[0].context.item,
                    layoutItem = selection[0].context.layoutItem,
                    layoutItemIndex = selection[0].context.index,
                    toolbar = [];

                if (selectedObject && selectedObject.type === 'layout') {
                    toolbar.push({
                        control: "menu",
                        domainObject: selectedObject,
                        method: function (option) {
                            let name = option.name.toLowerCase();
                            let form = DIALOG_FORM[name];
                            if (form) {
                                getUserInput(form)
                                    .then(element => selection[0].context.addElement(name, element));
                            } else {
                                selection[0].context.addElement(name);
                            }
                        },
                        key: "add",
                        icon: "icon-plus",
                        label: "Add",
                        options: [
                            {
                                "name": "Box",
                                "class": "icon-box-round-corners"
                            },
                            {
                                "name": "Line",
                                "class": "icon-line-horz"
                            },
                            {
                                "name": "Text",
                                "class": "icon-font"
                            },
                            {
                                "name": "Image",
                                "class": "icon-image"
                            }
                        ]
                    });
                }

                if (!layoutItem) {
                    return toolbar;
                }

                let path = `configuration.items[${layoutItemIndex}]`;
                let separator = {
                    control: "separator"
                };
                let remove = {
                    control: "button",
                    domainObject: selectedParent,
                    icon: "icon-trash",
                    title: "Delete the selected object",
                    method: function () {
                        let removeItem = selection[1].context.removeItem;
                        let prompt = openmct.overlays.dialog({
                            iconClass: 'alert',
                            message: `Warning! This action will remove this item from the Display Layout. Do you want to continue?`,
                            buttons: [
                                {
                                    label: 'Ok',
                                    emphasis: 'true',
                                    callback: function () {
                                        removeItem(layoutItem, layoutItemIndex);
                                        prompt.dismiss();
                                    }
                                },
                                {
                                    label: 'Cancel',
                                    callback: function () {
                                        prompt.dismiss();
                                    }
                                }
                            ]
                        });
                    }
                };

                if (layoutItem.type === 'subobject-view') {
                    if (toolbar.length > 0) {
                        toolbar.push(separator);
                    }

                    toolbar.push({
                        control: "toggle-button",
                        domainObject: selectedParent,
                        property: path + ".hasFrame",
                        options: [
                            {
                                value: false,
                                icon: 'icon-frame-hide',
                                title: "Hide frame"
                            },
                            {
                                value: true,
                                icon: 'icon-frame-show',
                                title: "Show frame"
                            }
                        ]
                    });
                    toolbar.push(separator);
                    toolbar.push(remove);
                } else {
                    const TEXT_SIZE = [9, 10, 11, 12, 13, 14, 15, 16, 20, 24, 30, 36, 48, 72, 96];
                    let fill = {
                            control: "color-picker",
                            domainObject: selectedParent,
                            property: path + ".fill",
                            icon: "icon-paint-bucket",
                            title: "Set fill color"
                        },
                        stroke = {
                            control: "color-picker",
                            domainObject: selectedParent,
                            property: path + ".stroke",
                            icon: "icon-line-horz",
                            title: "Set border color"
                        },
                        color = {
                            control: "color-picker",
                            domainObject: selectedParent,
                            property: path + ".color",
                            icon: "icon-font",
                            mandatory: true,
                            title: "Set text color",
                            preventNone: true
                        },
                        size = {
                            control: "select-menu",
                            domainObject: selectedParent,
                            property: path + ".size",
                            title: "Set text size",
                            options: TEXT_SIZE.map(size => {
                                return {
                                    value: size + "px"
                                };
                            })
                        },
                        x = {
                            control: "input",
                            type: "number",
                            domainObject: selectedParent,
                            property: path + ".x",
                            label: "X:",
                            title: "X position"
                        },
                        y = {
                            control: "input",
                            type: "number",
                            domainObject: selectedParent,
                            property: path + ".y",
                            label: "Y:",
                            title: "Y position",
                        },
                        width = {
                            control: 'input',
                            type: 'number',
                            domainObject: selectedParent,
                            property: path + ".width",
                            label: 'W:',
                            title: 'Resize object width'
                        },
                        height = {
                            control: 'input',
                            type: 'number',
                            domainObject: selectedParent,
                            property: path + ".height",
                            label: 'H:',
                            title: 'Resize object height'
                        };

                    if (layoutItem.type === 'telemetry-view') {
                        let displayMode = {
                                control: "select-menu",
                                domainObject: selectedParent,
                                property: path + ".displayMode",
                                title: "Set display mode",
                                options: [
                                    {
                                        name: 'Label + Value',
                                        value: 'all'
                                    },
                                    {
                                        name: "Label only",
                                        value: "label"
                                    },
                                    {
                                        name: "Value only",
                                        value: "value"
                                    }
                                ]
                            },
                            value = {
                                control: "select-menu",
                                domainObject: selectedParent,
                                property: path + ".value",
                                title: "Set value",
                                options: openmct.telemetry.getMetadata(selectedObject).values().map(value => {
                                    return {
                                        name: value.name,
                                        value: value.key
                                    }
                                })
                            };
                        toolbar = [
                            displayMode,
                            separator,
                            value,
                            separator,
                            fill,
                            stroke,
                            color,
                            separator,
                            size,
                            separator,
                            x,
                            y,
                            height,
                            width,
                            separator,
                            remove
                        ];
                    } else if (layoutItem.type === 'text-view' ) {
                        let text = {
                            control: "button",
                            domainObject: selectedParent,
                            property: path,
                            icon: "icon-gear",
                            title: "Edit text properties",
                            dialog: DIALOG_FORM['text']
                        };
                        toolbar = [
                            fill,
                            stroke,
                            color,
                            separator,
                            size,
                            separator,
                            x,
                            y,
                            height,
                            width,
                            separator,
                            text,
                            separator,
                            remove
                        ];
                    } else if (layoutItem.type === 'box-view') {
                        toolbar = [
                            fill,
                            stroke,
                            separator,
                            x,
                            y,
                            height,
                            width,
                            separator,
                            remove
                        ];
                    } else if (layoutItem.type === 'image-view') {
                        let url = {
                            control: "button",
                            domainObject: selectedParent,
                            property: path,
                            icon: "icon-image",
                            title: "Edit image properties",
                            dialog: DIALOG_FORM['image']
                        };
                        toolbar = [
                            stroke,
                            separator,
                            x,
                            y,
                            height,
                            width,
                            separator,
                            url,
                            separator,
                            remove
                        ];
                    } else if (layoutItem.type === 'line-view') {
                        let x2 = {
                            control: "input",
                            type: "number",
                            domainObject: selectedParent,
                            property: path + ".x2",
                            label: "X2:",
                            title: "X2 position"
                        },
                        y2 = {
                            control: "input",
                            type: "number",
                            domainObject: selectedParent,
                            property: path + ".y2",
                            label: "Y2:",
                            title: "Y2 position",
                        };
                        toolbar = [
                            stroke,
                            separator,
                            x,
                            y,
                            x2,
                            y2,
                            separator,
                            remove
                        ];
                    }
                }

                return toolbar;
            }
        }
    }

    return DisplayLayoutToolbar;
});