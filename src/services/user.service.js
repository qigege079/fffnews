import md5 from "js-md5";
import axios from 'axios';
import router from '../router'


export function login(email, password) {
  return axios.post('/mock/user/login', {
    user_account: email,
    user_password: md5(password)
  });
}

export function tokenAvailable() {
  if(getToken()) {
    return true;
  } else {
    return false;
  }
}

export function getToken() {
  return localStorage.getItem('authorization');
}

export function setToken(tokenStr) {
  localStorage.setItem('authorization', tokenStr);
}

export function getAccount() {
  return localStorage.getItem('account');
}

export function setAccount(accountStr) {
  localStorage.setItem('account', accountStr);
}