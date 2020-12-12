import { Component, OnInit } from '@angular/core';
import { NodeService } from '../node.service';
import { TreeNode } from 'primeng/api';
import { TreeDragDropService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { HelperClass } from './dassDataConversionHelper';
import {microServiceDataHelper} from './microServiceDataConversionHelper';

@Component({
  selector: 'app-tree-drag-drop',
  templateUrl: './tree-drag-drop.component.html',
  styles: [`
  h4 {
      text-align: center;
      margin: 0 0 8px 0;
  }
`],
  providers: [TreeDragDropService, MessageService]
})
export class TreeDragDropComponent implements OnInit {

  daasTreeNode: TreeNode[] = [];
  microServiceTreeNode : TreeNode[] = [];
  helper: HelperClass;
  microHelper : microServiceDataHelper;

  constructor(private nodeService: NodeService) {
    this.helper = new HelperClass();
    this.microHelper = new microServiceDataHelper();
  }

  ngOnInit(): void {

    /*
    For Daas data conversion
    */
    this.nodeService.getFilesUsingObs().subscribe(data => {
      console.log(data);
     const parentNodeObject = this.helper.createParentNode(data);
     this.daasTreeNode.push(parentNodeObject);
    });


    /*
    For Microservice data conversion
    */
    this.nodeService.getMicroSerJSONUsingObs().subscribe(data => {
        console.log(data);
       const parentNodeObject = this.microHelper.createParentNode(data);
       this.microServiceTreeNode = [...parentNodeObject];
      });
  
  }

}
