const express = require('express');
const axios = require('axios');
const cors = require('cors');
const CircuitBreaker = require('opossum');
const app = express();
const port = 3009;

app.use(express.json());
app.use(cors());

const options = {
  errorThresholdPercentage: 50,
  timeout: 3000,
  resetTimeout: 30000,
  retryCount: 5
};

const axiosGet = url => axios.get(url);
const axiosPut = url => axios.put(url);
const axiosPost = (url, data) => axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
const axiosDelete = url => axios.delete(url);

const breakerGet = new CircuitBreaker(axiosGet, options);
const breakerPut = new CircuitBreaker(axiosPut, options);
const breakerPost = new CircuitBreaker(axiosPost, options);
const breakerDelete = new CircuitBreaker(axiosDelete, options);

app.get('/api/producto/todos', async (req, res) => {
  try {
    const response = await breakerGet.fire('http://localhost:8080/api/producto/todos');
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while fetching products');
  }
});

app.put('/api/producto/comprar', async (req, res) => {
  try {
    const { id, cantidad } = req.query;
    const response = await breakerPut.fire(`http://localhost:8080/api/producto/comprar?id=${id}&cantidad=${cantidad}`);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while buying product');
  }
});

app.delete('/api/producto/eliminar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await breakerDelete.fire(`http://localhost:8080/api/producto/eliminar/${id}`);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while deleting product');
  }
});

app.put('/api/producto/actualizar/nombre', async (req, res) => {
  try {
    const { nombre, nuevoNombre } = req.query;
    const response = await breakerPut.fire(`http://localhost:8080/api/producto/actualizar/nombre?nombre=${nombre}&nuevoNombre=${nuevoNombre}`);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while updating product name');
  }
});

app.put('/api/producto/actualizar/precio', async (req, res) => {
  try {
    const { nombre, precio } = req.query;
    const response = await breakerPut.fire(`http://localhost:8080/api/producto/actualizar/precio?nombre=${nombre}&precio=${precio}`);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while updating product price');
  }
});

app.put('/api/producto/actualizar/cantidad', async (req, res) => {
  try {
    const { nombre, cantidad } = req.query;
    const response = await breakerPut.fire(`http://localhost:8080/api/producto/actualizar/cantidad?nombre=${nombre}&cantidad=${cantidad}`);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while updating product quantity');
  }
});

app.post('/api/producto/agregar', async (req, res) => {
    try {
      const newProduct = req.body;
      const response = await breakerPost.fire('http://localhost:8080/api/producto/agregar', newProduct);
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while adding new product');
    }
  });

  app.post('/users/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      let response;
      try {
        response = await breakerPost.fire('http://localhost:3010/users/login', { email, password });
      } catch (error) {
        if (error.response && error.response.status === 403) {
          response = await breakerPost.fire('http://localhost:3010/users/login', { email, password });
        } else {
          throw error;
        }
      }
      res.send(response.data);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Error occurred while logging in');
    }
  });
  
  app.post('/users/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const response = await breakerPost.fire('http://localhost:3010/users/register', { username, email, password });
      res.send(response.data);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).send('Error occurred while registering');
    }
  });

app.listen(port, () => {
  console.log(`BFF server listening at http://localhost:${port}`);
});

app.use("*", (_, res) => {
  return res.status(404).json({
    message: "API route not found",
  });
});