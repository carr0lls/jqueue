import request from 'superagent'

// Load test
for (let i = 1; i <= 10; i++) {
  let data = {
    url: 'test'+i+'.com'
  }
  request.post('localhost:4000/api/jobs').send(data).end((err, res) => console.log(i))
}

// Stress test
/*for (let i = 1; i <= 2000; i++) {
  let data = {
    url: 'test'+i+'.com'
  }
  request.post('localhost:4000/api/jobs').send(data).end((err, res) => console.log(i))
}*/
