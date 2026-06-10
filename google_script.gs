var SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
var ADMIN_EMAIL = "hannaccesorio@gmail.com";

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var requiredSheets = ['Productos', 'Departamentos', 'Categorias', 'Pedidos'];
  
  for (var s = 0; s < requiredSheets.length; s++) {
    var sheetName = requiredSheets[s];
    if (!ss.getSheetByName(sheetName)) {
      ss.insertSheet(sheetName);
      if (sheetName === 'Productos') {
        ss.getSheetByName(sheetName).appendRow(['id', 'nombre', 'precio', 'imagenUrl', 'departamento', 'categoria', 'destacado', 'referencia']);
      } else if (sheetName === 'Pedidos') {
        ss.getSheetByName(sheetName).appendRow(['fecha', 'cliente', 'telefono', 'direccion', 'total', 'detalles']);
      }
    } else if (sheetName === 'Productos') {
      var sheet = ss.getSheetByName('Productos');
      var headers = sheet.getDataRange().getValues()[0];
      if (headers.indexOf('referencia') === -1) {
        sheet.getRange(1, headers.length + 1).setValue('referencia');
      }
    }
  }
}

function doPost(e) {
  setupSheets();
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === "createOrder") {
      var sheet = ss.getSheetByName('Pedidos');
      var detalles = data.cart.map(function(item) { return item.quantity + "x " + item.name; }).join(", ");
      
      sheet.appendRow([
        data.date,
        data.customer.name,
        data.customer.phone,
        data.customer.address,
        data.totalPrice,
        detalles
      ]);
      
      var asunto = "NUEVO PEDIDO DE: " + data.customer.name;
      var mensaje = "";
      mensaje += "Se ha registrado un nuevo pedido.\n\n";
      mensaje += "Cliente: " + data.customer.name + "\n";
      mensaje += "Tel\u00e9fono: " + data.customer.phone + "\n";
      mensaje += "Direcci\u00f3n: " + data.customer.address + "\n\n";
      mensaje += "Productos: " + detalles + "\n\n";
      mensaje += "Total: $" + data.totalPrice;
      
      MailApp.sendEmail(ADMIN_EMAIL, asunto, mensaje);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "login") {
      var ADMIN_PASSWORD = "94377155";
      
      if (data.password === ADMIN_PASSWORD) {
        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Contrase\u00f1a incorrecta" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    if (data.action === "recoverPassword") {
      var ADMIN_PASSWORD = "94377155";
      var asunto = "Recuperaci\u00f3n de Contrase\u00f1a - Cat\u00e1logo Premium";
      var mensaje = "Hola, solicitaste recuperar tu contrase\u00f1a.\n\n";
      mensaje += "Tu contrase\u00f1a actual es: " + ADMIN_PASSWORD + "\n\n";
      mensaje += "Si deseas cambiarla, edita este archivo en Google Apps Script.";
      
      MailApp.sendEmail(ADMIN_EMAIL, asunto, mensaje);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "createProduct") {
      var sheet = ss.getSheetByName('Productos');
      var newId = new Date().getTime();
      
      sheet.appendRow([
        newId,
        data.product.name,
        data.product.price,
        data.product.imageUrl,
        data.product.department,
        data.product.category,
        "true",
        data.product.referencia || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "deleteProduct") {
      var sheet = ss.getSheetByName('Productos');
      var dataValues = sheet.getDataRange().getValues();
      var headers = dataValues[0];
      var idCol = headers.indexOf('id');
      
      for (var i = dataValues.length - 1; i >= 1; i--) {
        if (String(dataValues[i][idCol]) === String(data.productId)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Producto no encontrado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "updateProduct") {
      var sheet = ss.getSheetByName('Productos');
      var dataValues = sheet.getDataRange().getValues();
      var headers = dataValues[0];
      var idCol = headers.indexOf('id');
      
      for (var i = 1; i < dataValues.length; i++) {
        if (String(dataValues[i][idCol]) === String(data.productId)) {
          var row = i + 1;
          var update = data.product;
          
          if (update.name !== undefined) sheet.getRange(row, headers.indexOf('nombre') + 1).setValue(update.name);
          if (update.price !== undefined) sheet.getRange(row, headers.indexOf('precio') + 1).setValue(update.price);
          if (update.imageUrl !== undefined) sheet.getRange(row, headers.indexOf('imagenUrl') + 1).setValue(update.imageUrl);
          if (update.department !== undefined) sheet.getRange(row, headers.indexOf('departamento') + 1).setValue(update.department);
          if (update.category !== undefined) sheet.getRange(row, headers.indexOf('categoria') + 1).setValue(update.category);
          if (update.destacado !== undefined) sheet.getRange(row, headers.indexOf('destacado') + 1).setValue(update.destacado);
          if (update.referencia !== undefined) sheet.getRange(row, headers.indexOf('referencia') + 1).setValue(update.referencia);
          
          return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Producto no encontrado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  setupSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action;
  
  if (action === "getProducts") {
    var sheet = ss.getSheetByName('Productos');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var products = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var product = {};
      for (var j = 0; j < headers.length; j++) {
        product[headers[j]] = row[j];
      }
      products.push(product);
    }
    
    return ContentService.createTextOutput(JSON.stringify(products))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "getOrders") {
    var sheet = ss.getSheetByName('Pedidos');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var orders = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var order = {};
      for (var j = 0; j < headers.length; j++) {
        order[headers[j]] = row[j];
      }
      orders.push(order);
    }
    
    return ContentService.createTextOutput(JSON.stringify(orders))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ message: "Hello World" }))
    .setMimeType(ContentService.MimeType.JSON);
}
