import { TreeNode } from 'primeng/api';

enum IsChildrenNodePresent {
    NO = 0,
    YES = 1,
}

export class HelperClass {
    jsonSchema: any = {};
    files1: TreeNode[] = [];
    mainTreeArray: TreeNode[] = [];
    selectedFile: TreeNode;
    listOfTypesInSchema = [];

    constructor() { }


    createParentNode(data) {
        this.jsonSchema = data;
        this.listOfTypesInSchema = this.jsonSchema.__schema.types;
        const parentNode = data.__schema.queryType.name;
        return this.createSecondLevelObject(parentNode, data);
    }

    createSecondLevelObject(label, data) {
        const apiNamesList = this.listOfTypesInSchema.filter(x => x.name === label)[0];
        const childnestedChild = apiNamesList.fields;

        const type = apiNamesList.kind;

        //Create API Request object
        if (type === "OBJECT") {
            apiNamesList.fields.forEach(element => {

                const apiReqResArray: TreeNode[] = [];
                const requestObj = this.createRequestObjStructure(element);
                apiReqResArray.push(requestObj);

                //
                //Create API Response object
                const arrayOfRes = data.__schema.types.filter(x => x.name == element.type.ofType.name);
                const newArray = this.createArrayOfObjects(arrayOfRes[0].fields);
                const responseObj = this.createMainObjectStructure(element.type.ofType.name, newArray);
                apiReqResArray.push(responseObj);
                let obj = this.callObjectCreation(element.name, IsChildrenNodePresent.YES, apiReqResArray);

                this.mainTreeArray.push(obj);
            });

        }

        console.log(this.mainTreeArray);
        return this.mainTreeArray;
    }

    createMainObjectStructure(label, childArray): Object {
        const obj = this.callObjectCreation(label, IsChildrenNodePresent.YES, childArray);
        this.files1.push(obj);
        return obj;
    }

    createRequestObjStructure(child): Object {
        var listOfArgs = child.args;
        const _arr = this.createArrayOfObjects(listOfArgs);
        return this.createMainObjectStructure(child.name, _arr);
    }


    createArrayOfObjects(array) {
        const tempArray = [];

        array.forEach(element => {
            // When type is primitive
            if (element.type.kind === "SCALAR") {
                tempArray.push(this.setLeafNode(element.name));
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
        } else if (element.type.kind === "LIST" && element.type.ofType.kind !== "SCALAR") {
            temp = this.listOfTypesInSchema.filter(x => x.name == element.type.ofType.name);
            tempArray.push(this.createResObjForTypeObject(temp, element.name));
        }

        return tempArray;
    }


    setLeafNode(label) {
        return this.callObjectCreation(label, IsChildrenNodePresent.NO);
    }

    createResObjForTypeObject(obj, propName) {
        var children = this.transform(obj[0].fields);
        return this.callObjectCreation(propName, IsChildrenNodePresent.YES, children);
    }

    transform(array) {
        var childrenArray = [];
        array.forEach(element => {
            const obj = this.callObjectCreation(element.name, IsChildrenNodePresent.NO);
            childrenArray.push(obj);
        });

        return childrenArray;
    }

    callObjectCreation(label, isChild, childrenArray = []) {
        let obj: any = {
            label: label,
            collapsedIcon: 'pi pi-folder-open',
            expandedIcon: 'pi pi-folder',
        }

        if (isChild) {
            obj.children = childrenArray
        }

        return obj;
    }

}



