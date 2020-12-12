import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';

enum IsChildrenNodePresent {
    NO = 0,
    YES = 1,
}

export class microServiceDataHelper {
    mainTreeArray: TreeNode[] = [];
    apiMethodsArray: TreeNode[] = [];
    responseArray: TreeNode[] = [];
    selectedFile: TreeNode;
    listOfTypesInSchema = [];
    collapsedIcon: string = 'pi pi-folder-open';
    expandedIcon: string = 'pi pi-folder';
    ELEMENT_TYPE_KIND_SCALAR = 'SCALAR';
    METHOD_ARGS_NODE = "Arguments";
    METHOD_RESPONSE_NODE = "Responses"
    schemaData;

    constructor() { }

    createParentNode(JSONData) {

        let title = JSONData.info.title;
        this.schemaData = JSONData;
        let pathArray = Object.keys(JSONData.paths);

        pathArray.forEach(function (item) {
            let apiMethodType = JSONData.paths[item];
            const apiMethodsArray = Object.entries(apiMethodType);

            // create object for each api method and its children elements
            apiMethodsArray.forEach(function (element: any) {
                this.createApiMethodObjects(element,JSONData);
            }, this)
        }, this)

        // append all api method children node to main node 
        let node = this.createTreeNodeObject(title,IsChildrenNodePresent.YES,this.apiMethodsArray);
        this.mainTreeArray.push(node);

        return this.mainTreeArray;
    }

    createApiMethodObjects(element,JSONData) {
        let elementMappingArray = [];

        //Args
        elementMappingArray.push(this.createArgumentsObject(element[1]));

        //Responses
        elementMappingArray.push(this.createResponseObject(element));

        let node = Object.keys(JSONData.paths)[0] + "/" + element[0].toUpperCase() + "-" +
            element[1].operationId;
        this.apiMethodsArray.push(this.createTreeNodeObject(node, IsChildrenNodePresent.YES, elementMappingArray));

    }

    createArgumentsObject(element): Object {
        let argsNodeArray = [];
        for (let param = 0; param < element.parameters.length; param++) {
            let nodeName = this.concatNameAndType(element.parameters[param].name,"string");
            let nodeObject =
                this.createTreeNodeObject(nodeName, IsChildrenNodePresent.NO);

            argsNodeArray.push(nodeObject);
        }

        return this.createTreeNodeObject(this.METHOD_ARGS_NODE, IsChildrenNodePresent.YES, argsNodeArray);
    }

    createResponseObject(element): Object {
        this.mapResponseObjectToData(element);
        let responseObject =
            this.createTreeNodeObject(this.METHOD_RESPONSE_NODE, IsChildrenNodePresent.YES, this.responseArray);
        return responseObject;
    }

    mapResponseObjectToData(element) {
        const verb = element[0];
        const res = element[1].responses;
        const successResponse = res['200'].schema;
        let def = Object.values(successResponse)[0] as string;
        const definitionType = def.split('/')[2];
        let fields = this.searchFromDefinition(definitionType);
        for (const key in fields) {
            const mainTreeNode = this.populateObjectBasedOnDataType(fields[key], key);
            this.responseArray.push(mainTreeNode);
        }
    }

    searchFromDefinition(type) {
        let fields;
        let defintionNode = this.schemaData.definitions;
        if (defintionNode[type].properties.member) {
            fields = defintionNode[type].properties.member.properties;
        } else {
            fields = defintionNode[type].properties;
        }

        return fields;

    }

    populateObjectBasedOnDataType(object, key) {
        let hasChildNode = true;
        let childrenNodeArray = [];
        if (object) {
            if (object.type === "string") {
                hasChildNode = false;
                key = this.concatNameAndType(key,"string");
            } else {
                childrenNodeArray = [...this.nonPrimitiveObject(object)];
            }
            return this.createTreeNodeObject(key, hasChildNode, childrenNodeArray);
        }

    }

    nonPrimitiveObject(object) {
        let prop;
        if (!object.type) {
            return this.forReferenceDefintionType(object);
        }
        else if (object.type === "object") {
            prop = object['properties'];
        } else if (object.type === "array") {
            prop = object['items']['properties'];
        }

        return this.iterateOverObjectElements(prop);
    }

    forReferenceDefintionType(object) {
        let refArray = [];
        let ref = object['$ref'];
        const definitionType = ref.split('/')[2];
        let fields = this.searchFromDefinition(definitionType);
        for (const key in fields) {
            refArray.push(this.populateObjectBasedOnDataType(fields[key], key));
        }

        return refArray;

    }

    iterateOverObjectElements(obj) {
        var arr = [];
        for (const item in obj) {
            arr.push(this.populateObjectBasedOnDataType(obj[item], item));
        }

        return arr;
    }

    createTreeNodeObject(label, isChild, childrenArray = []) {
        let obj: any = {
            label: label,
            collapsedIcon: this.collapsedIcon,
            expandedIcon: this.expandedIcon
        }

        if (isChild) {
            obj.children = childrenArray
        }

        return obj;
    }

    concatNameAndType(eleName, eleType) {
        return eleName + ' (' + eleType + ')';
    }

}

















// createTreeNodeForScalarType(objectKey) {
//     this.createTreeNodeObject(objectKey, IsChildrenNodePresent.NO);
// }

// createTreeNodeForListType() {

// }

// createTreeNodeForObjectType(key, props) {
//     for(const val in props) {
//         const nestedProp = props[val]['properties']

//     }
// }




