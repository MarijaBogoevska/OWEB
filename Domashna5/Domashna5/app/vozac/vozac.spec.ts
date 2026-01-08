import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vozac } from './vozac';

describe('Vozac', () => {
  let component: Vozac;
  let fixture: ComponentFixture<Vozac>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vozac]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vozac);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
