import React, { useState } from "react";
import axios from "axios";

const Api = () => {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/submit/",
        formData
      );
      setResponse(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Contact Form</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" onChange={handleChange} placeholder="Name" />
        <input name="message" onChange={handleChange} placeholder="Message" />
        <button type="submit">Send</button>
      </form>
      {response && <p>Response: {JSON.stringify(response)}</p>}
      ewfsaf
    </div>
  );
};

export default Api;
