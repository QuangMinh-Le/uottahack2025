import React, { useState, useEffect } from 'react';
import solace from 'solclientjs';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Washroom(id, totalStalls, availableStalls, gender) {
    this.id = id;
    this.totalStalls = totalStalls;
    this.availableStalls = availableStalls;
    this.gender = gender;
}

export default Washroom;
