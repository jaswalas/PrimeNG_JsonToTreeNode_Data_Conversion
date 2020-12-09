import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDragDropComponent } from './tree-drag-drop.component';

describe('TreeDragDropComponent', () => {
  let component: TreeDragDropComponent;
  let fixture: ComponentFixture<TreeDragDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeDragDropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeDragDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
