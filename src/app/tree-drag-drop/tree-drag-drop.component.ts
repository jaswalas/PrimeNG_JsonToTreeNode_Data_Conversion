import { Component, OnInit } from '@angular/core';
import { NodeService } from '../node.service';
import { TreeNode } from 'primeng/api';
import { TreeDragDropService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { HelperClass } from './helperClass'

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

  treeNodeSource: TreeNode[] = [];
  helper: HelperClass;

  constructor(private nodeService: NodeService) {
    this.helper = new HelperClass();
  }

  ngOnInit(): void {

    this.nodeService.getFilesUsingObs().subscribe(data => {
      console.log(data);
     this.treeNodeSource = this.helper.createParentNode(data);
    });


    // this.nodeService.getFilesUsingObs().subscribe(files => {
    //   this.files2 = files.data
    // });
    //this.nodeService.getFiles().then(files => this.files1 = files);
    // this.nodeService.getFiles().then(files => this.files2 = files);

    // this.files3 = [{
    //   label: 'BackUp',
    //   data: 'BackUp Folder',
    //   expandedIcon: "pi pi-folder-open",
    //   collapsedIcon: "pi pi-folder"
    // }];


    // this.files2 = [{
    //   label: 'Storage',
    //   data: 'Storage Folder',
    //   expandedIcon: "pi pi- folder-open",
    //   collapsedIcon: "pi pi-folder"
    // }];





  }

}
