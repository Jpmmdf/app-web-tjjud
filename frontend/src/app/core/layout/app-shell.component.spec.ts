import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { CatalogFacadeService, FlashMessage } from '../state/catalog-facade.service';

@Component({
  standalone: true,
  template: '<p>Rota carregada</p>',
})
class DummyRouteComponent {}

describe('AppShellComponent', () => {
  let loadingSignal: WritableSignal<boolean>;
  let flashSignal: WritableSignal<FlashMessage | null>;
  let refreshAllSpy: jasmine.Spy;

  beforeEach(async () => {
    loadingSignal = signal(false);
    flashSignal = signal<FlashMessage | null>(null);
    refreshAllSpy = jasmine.createSpy('refreshAll').and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        {
          provide: CatalogFacadeService,
          useValue: {
            refreshAll: refreshAllSpy,
            loading: loadingSignal,
            flash: flashSignal,
            clearFlash: jasmine.createSpy('clearFlash'),
          },
        },
        provideRouter([
          { path: 'visao-geral', component: DummyRouteComponent },
          { path: 'autores', component: DummyRouteComponent },
          { path: 'assuntos', component: DummyRouteComponent },
          { path: 'livros', component: DummyRouteComponent },
          { path: 'relatorios', component: DummyRouteComponent },
        ]),
      ],
    }).compileComponents();
  });

  it('should render the simplified fixed menu shell', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header.app-nav')).not.toBeNull();
    expect(compiled.querySelector('nav#main-navigation')).not.toBeNull();
    expect(compiled.querySelector('main#main-content')).not.toBeNull();
    expect(compiled.querySelector('footer')).toBeNull();
    expect(compiled.textContent).toContain('Catálogo editorial');
  });

  it('should refresh catalog data on init', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(refreshAllSpy).toHaveBeenCalled();
  });
});
