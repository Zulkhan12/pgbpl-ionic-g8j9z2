import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  username= '';
  password= '';
  constructor() { }

  ngOnInit() {
  }

  login(){
    if(this.username==='admin' && this.password==='password'){
      window.location.href='main';
    } else {
      alert('Invalid Credentials');
    }
  }
}
