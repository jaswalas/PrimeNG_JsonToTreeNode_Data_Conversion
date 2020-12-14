import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
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

export class microServiceDataHelper {
    mainTreeArray: TreeNode[] = [];
    apiMethodsArray: TreeNode[] = [];
    responseArray: TreeNode[] = [];
    selectedFile: TreeNode;
    listOfTypesInSchema = [];
    schemaData;

    constructor() { }

    /*
    Main method to create root level json data
    */
    createParentNode(JSONData) {

        let title = JSONData.info.title;
        this.schemaData = JSONData;
        let pathArray = Object.keys(JSONData.paths);

        pathArray.forEach(function (item) {
            let apiMethodType = JSONData.paths[item];
            const apiMethodsArray = Object.entries(apiMethodType);

            // create object for each api method and its children elements
            apiMethodsArray.forEach(function (element: any) {
                this.createApiMethodObjects(element, JSONData);
            }, this)
        }, this)

        // append all api method children node to MAIN node 
        let node = createTreeNodeObject(title, IsChildrenNodePresent.YES, this.apiMethodsArray);
        this.mainTreeArray.push(node);

        return this.mainTreeArray;
    }

    /*
    Method to create  object for Args tree nodes and Response tree node
    Each Api method will have separate Args and Response object structure as child
    */
    createApiMethodObjects(element, JSONData) {
        let elementMappingArray = [];

        //Args
        elementMappingArray.push(this.createArgumentsObject(element[1]));

        //Responses
        elementMappingArray.push(this.createResponseObject(element));

        let node = Object.keys(JSONData.paths)[0] + "/" + element[0].toUpperCase() + "-" +
            element[1].operationId;
        this.apiMethodsArray.push(createTreeNodeObject(node, IsChildrenNodePresent.YES, elementMappingArray));

    }

   /*
   Create object that will represent Arguments for the API
   */
    createArgumentsObject(element): Object {
        let argsNodeArray = [];
        for (let param = 0; param < element.parameters.length; param++) {
            let nodeName = concatNameAndType(element.parameters[param].name, "string");
            let nodeObject =
                createTreeNodeObject(nodeName, IsChildrenNodePresent.NO);

            argsNodeArray.push(nodeObject);
        }

        return createTreeNodeObject(METHOD_ARGS_NODE, IsChildrenNodePresent.YES, argsNodeArray);
    }

    /*
   Create object that will represent Response parameter for the API
   */
    createResponseObject(element): Object {
        this.mapResponseObjectToData(element);
        let responseObject =
            createTreeNodeObject(METHOD_RESPONSE_NODE, IsChildrenNodePresent.YES, this.responseArray);
        return responseObject;
    }

    /*
        Map 200( successful) response data to parent tree node
    */
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

    /*
    Method to populate object from Definition section in case the value for the key field
    is a reference to the defintion section of Json
    */
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

    /*
    Populate object ( tree object structure) based on data type  
    */
    populateObjectBasedOnDataType(object, key) {
        let hasChildNode = true;
        let childrenNodeArray = [];
        if (object) {
            if (object.type === "string") {
                hasChildNode = false;
                key = concatNameAndType(key, "string");
            } else {
                childrenNodeArray = [...this.nonPrimitiveObject(object)];
            }
            return createTreeNodeObject(key, hasChildNode, childrenNodeArray);
        }

    }

    /*
    For non-primitive type data 
    */
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

    // Method to extract fields from Definition node of JSON data
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

    //Method to iterate over non-primitive data type inner objects/fields
    iterateOverObjectElements(obj) {
        var arr = [];
        for (const item in obj) {
            arr.push(this.populateObjectBasedOnDataType(obj[item], item));
        }

        return arr;
    }

}