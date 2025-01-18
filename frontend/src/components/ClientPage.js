import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ClientPage.css';

const ClientPage = (props) => {
    const [genderFilter, setGenderFilter] = useState('all');

    const washrooms = [
        { id: 1, name: 'Washroom 1', gender: 'male' },
        { id: 2, name: 'Washroom 2', gender: 'female' },
        { id: 3, name: 'Washroom 3', gender: 'unisex' },
    ];

    const filteredWashrooms = washrooms.filter(washroom =>
        genderFilter === 'all' || washroom.gender === genderFilter
    );
    
    return (
        <div className="container-fluid">
            {/* Top Half: Floorplan Image */}
            <div className="row">
                <div className="col-12">
                    <div className="text-center my-3">
                        <img 
                            src="/Floor1.png" 
                            alt="Floorplan" 
                            className="img-fluid border"
                            style={{ maxHeight: '400px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Half: Washroom List and Filter */}
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center my-3">
                        <h2>Washrooms</h2>
                        <div>
                            <label className="me-2">Filter by Gender:</label>
                            <select 
                                className="form-select d-inline-block w-auto" 
                                value={genderFilter} 
                                onChange={(e) => setGenderFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="unisex">Unisex</option>
                            </select>
                        </div>
                    </div>

                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Floor 1</th>
                                <th>Gender</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWashrooms.map(washroom => (
                                <tr key={washroom.id}>
                                    <td>{washroom.name}</td>
                                    <td>{washroom.gender}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientPage;