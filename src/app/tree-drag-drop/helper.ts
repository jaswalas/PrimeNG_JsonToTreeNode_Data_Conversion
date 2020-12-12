export enum IsChildrenNodePresent {
    NO = 0,
    YES = 1,
}

export const collapsedIcon = 'pi pi-folder-open';
export const expandedIcon: string = 'pi pi-folder';
export const ELEMENT_TYPE_KIND_SCALAR = 'SCALAR';
export const METHOD_ARGS_NODE = "Arguments";
export const METHOD_RESPONSE_NODE = "Responses"


export const createTreeNodeObject = (label, isChild, childrenArray = []): Object => {
    let obj: any = {
        label: label,
        collapsedIcon: collapsedIcon,
        expandedIcon: expandedIcon
    }

    if (isChild) {
        obj.children = childrenArray
    }

    return obj;
}

export const concatNameAndType = (eleName, eleType) =>{
    return eleName + ' (' + eleType + ')';
}