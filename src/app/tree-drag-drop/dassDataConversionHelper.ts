import { TreeNode } from 'primeng/api';
import {
    IsChildrenNodePresent,
    collapsedIcon,
    expandedIcon,
    ELEMENT_TYPE_KIND_SCALAR,
    METHOD_RESPONSE_NODE,
    METHOD_ARGS_NODE,
    concatNameAndType,
    createTreeNodeObject
} from './helper';

export class HelperClass {
    mainTreeArray: TreeNode[] = [];
    selectedFile: TreeNode;
    listOfTypesInSchema = [];

    constructor() { }

    createParentNode(JSONData): Object {
        this.listOfTypesInSchema = JSONData.__schema.types;
        const parentNode = JSONData.__schema.queryType.name;
        const mappedDataToTreeView = this.mapJsonToTreeNode(parentNode, JSONData);
        return mappedDataToTreeView;
    }

    mapJsonToTreeNode(parentNode, jsonData):Object {
        const apiMapperSchema = this.createSecondLevelObject(parentNode, jsonData);
        return createTreeNodeObject(parentNode, IsChildrenNodePresent.YES, apiMapperSchema);
    }

    createSecondLevelObject(label, data): Array<Object> {
        const apiNamesList = this.listOfTypesInSchema.filter(x => x.name === label)[0];
        const childnestedChild = apiNamesList.fields;
        apiNamesList.fields.forEach(element => {

            //Create API ( method) Request( arguments) object
            const apiReqResArray: TreeNode[] = [];

            // Arguments section
            this.convertToTreeStructure(element.args, METHOD_ARGS_NODE, apiReqResArray);

            //response Section
            const arrayOfRes = data.__schema.types.filter(x => x.name == element.type.ofType.name)[0];
            this.convertToTreeStructure(arrayOfRes.fields, METHOD_RESPONSE_NODE, apiReqResArray);

            let methodLevelTreeStructure = createTreeNodeObject(element.name, IsChildrenNodePresent.YES, apiReqResArray);
            this.mainTreeArray.push(methodLevelTreeStructure);
        });

        return this.mainTreeArray;
    }

    convertToTreeStructure(element, nodeHeader, mainTreeArray) {
        const _arr = this.mapHierarchyOfJsonData(element);
        const arrayStructure = createTreeNodeObject(nodeHeader, IsChildrenNodePresent.YES, _arr);
        return mainTreeArray.push(arrayStructure);
    }

    mapHierarchyOfJsonData(array): any[] {
        const tempArray = [];
        array.forEach(element => {
            // When type is primitive
            if (element.type.kind === ELEMENT_TYPE_KIND_SCALAR) {
                return this.convertDataForSimpleType(element.name, tempArray);
            } else {
                // When type is complex
                this.createObjectForNonPrimitive(element, tempArray)
            }
        });
        return tempArray;
    }

    createObjectForNonPrimitive(element, tempArray) {
        let temp;
        if (element.type.kind === "OBJECT") {
            temp = this.listOfTypesInSchema.filter(x => x.name == element.type.name);
            tempArray.push(this.createResObjForTypeObject(temp, element.name));
        } else if (element.type.kind === "LIST" &&
            element.type.ofType.kind !== ELEMENT_TYPE_KIND_SCALAR) {
            temp = this.listOfTypesInSchema.filter(x => x.name == element.type.ofType.name);
            tempArray.push(this.createResObjForTypeObject(temp, element.name));
        }

        return tempArray;
    }

    createResObjForTypeObject(obj, propName) {
        var children = this.transform(obj[0].fields);
        return createTreeNodeObject(propName, IsChildrenNodePresent.YES, children);
    }

    transform(array) {
        var childrenArray = [];
        array.forEach(element => {
            if (element.type.kind === ELEMENT_TYPE_KIND_SCALAR) {
                return this.convertDataForSimpleType(element.name, childrenArray);
            } else {
                this.createObjectForNonPrimitive(element, childrenArray)
            }

            return childrenArray;
        });

        return childrenArray;
    }

    convertDataForSimpleType(element, parentArrayToAppendTo)   {
        const nodeName = concatNameAndType(element, "String");
        const obj = createTreeNodeObject(nodeName, IsChildrenNodePresent.NO);
        parentArrayToAppendTo.push(obj);
    }
}



