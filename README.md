# dakota-inventory


TO teest the new compilation system, run the following command:

curl -X POST http://localhost:3001/api/cache-compiler \
  -H "Content-Type: application/json" \
  -d '{"action": "compile", "password": "tu_contraseña"}'

  This command will be ejecuted after the command npm start. 