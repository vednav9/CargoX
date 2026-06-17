import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Driver } from './driver';

describe('Driver', () => {
  let component: Driver;
  let fixture: ComponentFixture<Driver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Driver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Driver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
