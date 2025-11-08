import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then((m) => m.CadastroPage),
  },
  {
    path: 'run',
    loadComponent: () => import('./run/run.page').then( m => m.RunPage)
  },
  {
    path: 'grupo',
    loadComponent: () => import('./grupo/grupo.page').then( m => m.GrupoPage)
  },
{
  path: 'homelogado',
  loadComponent: () => import('./homelogado/homelogado.page').then(m => m.HomeLogadoPage),
},
  {
  path: 'historico',
  loadComponent: () =>
    import('./historico/historico.page').then(m => m.HistoricoPage),
},
   {
    path: 'altersenha',
    loadComponent: () => import('./altersenha/altersenha.page').then(m => m.AlterarSenhaPage)
  },





];
