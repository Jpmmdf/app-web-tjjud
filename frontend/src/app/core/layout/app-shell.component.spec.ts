import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import packageJson from '../../../../package.json';
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
    const versionBadge = compiled.querySelector('.app-nav__version');
    expect(compiled.querySelector('header.app-nav')).not.toBeNull();
    expect(compiled.querySelector('nav#main-navigation')).not.toBeNull();
    expect(compiled.querySelector('main#main-content')).not.toBeNull();
    expect(compiled.querySelector('footer')).toBeNull();
    expect(compiled.textContent).toContain('Catálogo editorial');
    expect(compiled.textContent).toContain(`Versão ${packageJson.version}`);
    expect(versionBadge?.getAttribute('title')).toBe(`Versão atual da aplicação: ${packageJson.version}`);
  });

  it('should toggle mobile navigation state from the menu button', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const menuButton = compiled.querySelector('.app-nav__toggle') as HTMLButtonElement;
    const navigation = compiled.querySelector('#main-navigation') as HTMLElement;

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(navigation.classList.contains('app-nav__links--open')).toBeFalse();

    menuButton.click();
    fixture.detectChanges();

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(navigation.classList.contains('app-nav__links--open')).toBeTrue();
  });

  it('should refresh catalog data on init', async () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(refreshAllSpy).toHaveBeenCalled();
  });
});
