// import ReduxClient from "../../packages/pawjs-redux/src/client";
import './resources/css/style.scss';
import React from 'react';
import { Link } from 'react-router-dom';

import FirebaseClient from "../../packages/pawjs-firebase/src/client";
import FirebaseOptions from "../firebase.json";

new FirebaseClient(FirebaseOptions);

export default class Client {}
