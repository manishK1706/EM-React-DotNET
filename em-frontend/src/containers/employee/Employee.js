import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import $ from "jquery";
import "jquery/dist/jquery.min.js";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";
import "datatables.net-bs4/js/dataTables.bootstrap4.min.js";

function Employee() {
    const [employees, setEmployees] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [form, setForm] = useState({name:"", age: "", department: "", email: "", joiningDate: ""});
    const [formError, setFormError] = useState({name:"", age: "", department: "", email: "", joiningDate: ""});

    const changeHandler = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });

        setFormError(prev => ({ ...prev, [e.target.name]: "" }));
    };

    // Fetch all employees
    function getAllEmployees() {
        try {
            axios.get("https://localhost:7003/api/employees").then((res) => {
                setEmployees(res.data);
            });
        } catch (error) {
            alert(error?.message);
        }
    }

    // Fetch all employees on component mount
    useEffect(()=>{
        getAllEmployees();
    },[]);

    // Initialize DataTable
    useEffect(() => {
        if (employees) {
            setTimeout(() => {
                $("#tblData").DataTable({
                    autoWidth: false,
                    responsive: true,
                    destroy: true,
                    retrieve: true
                });
            }, 0);
        }
    }, [employees]);

    // Render employees in table
    function renderEmployees() {
        return employees?.map((item) => {
            return (
                <tr key={item.employeeId}>
                    <td>{item.name}</td>
                    <td>{item.age}</td>
                    <td>{item.department}</td>
                    <td>{item.email}</td>
                    <td>{item.joiningDate.slice(0, 10)}</td>
                    <td>
                        <button
                            className="btn btn-info m-1" data-target="#editEmployee" data-toggle="modal" onClick={() => { setEmployeeId(item.employeeId); setForm({ ...item, joiningDate: item.joiningDate.slice(0, 10) }); }}
                        >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button
                            className="btn btn-danger" onClick={() => deleteClick(item.employeeId)}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} /> Delete
                        </button>
                    </td>
                </tr>
            );
        });
    }

    // Reset form fields
    function resetForm() {
        setForm({ name: "", age: "", department: "", email: "", joiningDate: "" });
        setFormError({ name: "", age: "", department: "", email: "", joiningDate: "" });
    }

    // Save employee
    async function saveClick() {
        try {
            const res = await axios.post("https://localhost:7003/api/employees", form);
            // alert("Employee Added Successfully");
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Employee Added Successfully',
            });
            toast.success("Employee Added Successfully 🎉", {
                position: "top-right",
                autoClose: 3000,
            });
            getAllEmployees();
            resetForm();
            // Close the modal
            window.$('#newEmployee').modal('hide');
        } catch (error) {
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data === "Email already exists"
            ) {
                setFormError(prev => ({ ...prev, email: "Email already exists" }));
            } else {
                alert(error?.message || "Something went wrong");
            }
        }
    }
    // Update employee
    async function updateClick() {
        try {
            const res = await axios.put(`https://localhost:7003/api/employees/${form.employeeId}`, form);
            // alert("Employee Updated Successfully");
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Employee Updated Successfully',
            });
            toast.success("Employee Updated Successfully 🎉", {
                position: "top-right",
                autoClose: 3000,
            });
            getAllEmployees();
            resetForm();
            // Close the modal
            window.$('#editEmployee').modal('hide');
        } catch (error) {
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data === "Email already exists"
            ) {
                setFormError(prev => ({ ...prev, email: "Email already exists" }));
            } else {
                alert(error?.message || "Something went wrong");
            }
        }
    }

    // Delete employee
    function deleteClick(id){
        Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "Do you want to delete this employee?",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    axios.delete(`https://localhost:7003/api/employees/${id}`).then(() => {
                        Swal.fire({
                            icon: 'success',
                            title: "Success!",
                            text: "Employee data deleted Successfully",
                        });
                        toast.success("Employee removed successfully! 🗑️", {
                            position: "top-right",
                            autoClose: 3000,
                        });
                        getAllEmployees();
                    });
                } catch (error) {
                    alert(error?.message);
                }
            }
            else {
                Swal.fire("Cancelled", "The employee was not deleted", "info");
                toast.error("Deleting cancelled! 🗑️", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        });
    }

    // Validate form fields and call save or update function
    function onSubmit(){
        let errors = false;
        let error = {name:"", age: "", department: "", email: "", joiningDate: ""};
        if (form.name.trim().length == 0) {
            errors = true;
            error = {...error, name: "Name is required" };
        }
        if(!form.age || form.age < 18){
            errors = true;
            error = {...error, age: "Valid age greater than 18 required" };
        }
        if(form.department.trim().length == 0){
            errors = true;
            error = {...error, department: "Department is required" };
        }
        if(form.email.trim().length == 0){
            errors = true;
            error = {...error, email: "Email is required" };
        }
        else if(!/\S+@\S+\.\S+/.test(form.email)){
            errors = true;
            error = {...error, email: "Email is not valid" };
        }
        if(!form.joiningDate){
            errors = true;
            error = {...error, joiningDate: "Joining Date is required" };
        }
        if (errors) setFormError(error);
        else {
            setFormError(error);
            employeeId ? updateClick() : saveClick();
        }
    }

    return (
        <>
            <div className='row m-2'>
                <div className='col-9'>
                    <h2 className='text-primary text-left ml-2'>Employees List</h2>
                </div>
                <div className='col-3'>
                    <button className='btn btn-info form-control' data-target="#newEmployee" data-toggle="modal">
                        <FontAwesomeIcon icon={faPlus} /> Add New Employee
                    </button>
                </div>
            </div>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-12 p-3'>
                        <div className='table-responsive'>
                            <table id="tblData" className='table table-striped table-bordered table-hover w-100'>
                                <thead>
                                    <tr className='text-center'>
                                        <th>Name</th>
                                        <th>Age</th>
                                        <th>Department</th>
                                        <th>Email</th>
                                        <th>Joining Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {renderEmployees()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* New Employee */}
            <div className="modal" tabindex="-1" role="dialog" id='newEmployee'>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-secondary">
                            <h5 className="modal-title text-white">New Employee</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className='form-group row'>
                                <label className='col-4'>Name</label>
                                <div className='col-8'>
                                    <input type='text' className='form-control' name='name' placeholder="Enter Name" onChange={changeHandler} value={form.name} />
                                    <p className='text-danger'>{formError.name}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Age</label>
                                <div className='col-8'>
                                    <input type='number' className='form-control' name='age' placeholder="Enter Age" onChange={changeHandler} value={form.age} />
                                    <p className='text-danger'>{formError.age}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Department</label>
                                <div className='col-8'>
                                    <input type='text' className='form-control' name='department' placeholder="Enter Department" onChange={changeHandler} value={form.department} />
                                    <p className='text-danger'>{formError.department}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Email</label>
                                <div className='col-8'>
                                    <input type='text' className='form-control' name='email' placeholder="Enter Email" onChange={changeHandler} value={form.email} />
                                    <p className='text-danger'>{formError.email}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Joining Date</label>
                                <div className='col-8'>
                                    <input type='date' className='form-control' name='joiningDate' onChange={changeHandler} value={form.joiningDate} />
                                    <p className='text-danger'>{formError.joiningDate}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-success" onClick={onSubmit}>Save changes</button>
                            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={resetForm}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Employee */}
            <div className="modal" tabindex="-1" role="dialog" id='editEmployee'>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-secondary">
                            <h5 className="modal-title text-white">Edit Employee</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className='form-group row'>
                                <label className='col-4'>Name</label>
                                <div className='col-8'>
                                    <input type='text' className='form-control' name='name' placeholder="Enter Name" onChange={changeHandler} value={form.name} />
                                    <p className='text-danger'>{formError.name}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Age</label>
                                <div className='col-8'>
                                    <input type='number' className='form-control' name='age' placeholder="Enter Age" onChange={changeHandler} value={form.age} />
                                    <p className='text-danger'>{formError.age}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Department</label>
                                <div className='col-8'>
                                    <input type='text' className='form-control' name='department' placeholder="Enter Department" onChange={changeHandler} value={form.department} />
                                    <p className='text-danger'>{formError.department}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Email</label>
                                <div className='col-8'>
                                    <input type='text' className='form-control' name='email' placeholder="Enter Email" onChange={changeHandler} value={form.email} />
                                    <p className='text-danger'>{formError.email}</p>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-4'>Joining Date</label>
                                <div className='col-8'>
                                    <input type='date' className='form-control' name='joiningDate' onChange={changeHandler} value={form.joiningDate} />
                                    <p className='text-danger'>{formError.joiningDate}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-success" onClick={onSubmit}>Save changes</button>
                            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={resetForm}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Employee