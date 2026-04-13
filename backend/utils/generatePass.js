const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// creating pdf pass
async function generatePass(visitor, qrData){
  try{
    // correct path
    const folderPath = path.join(__dirname, "../uploads/passes");

    // create folder if not exists
    if(!fs.existsSync(folderPath)){
      fs.mkdirSync(folderPath, {recursive: true});
    }

    const fileName = `pass_${visitor._id}.pdf`;
    const finalPath = path.join(folderPath, fileName);

    const doc = new PDFDocument({
      size: "A6",
      margins:{top: 10, bottom: 10, left: 10, right: 10 },
    })

    const writeStream = fs.createWriteStream(finalPath);
    doc.pipe(writeStream);

    //HEADER
    doc.rect(0, 0, 300, 40).fill("#2c3e50");
    doc.fillColor("#ffffff").fontSize(16).text("VISITOR PASS", 0, 12, {
      align: "center",
    });

    //PHOTO
    let photoPath = "";

    if(visitor.photo){
      photoPath = path.join(__dirname, "../uploads/photos", visitor.photo);
    }

    if(photoPath && fs.existsSync(photoPath)){
      doc.image(photoPath, 110, 50, { width: 80, height: 80 });
    } 
    else{
      doc.rect(110, 50, 80, 80).stroke();
      doc.fillColor("#000000")
        .fontSize(8)
        .text("NO PHOTO", 110, 85, { align: "center", width: 80 })}

    //DETAILS
    doc.fillColor("#000000").fontSize(10);
    let currentY = 140;

    const formattedDate = visitor.visitDate ? new Date(visitor.visitDate).toLocaleDateString() : "N/A";

    doc.text("Visitor Name: " + visitor.name, 20, currentY);
    doc.text("Phone Number: " + visitor.phone, 20, currentY + 15);
    doc.text("Visiting For: " + (visitor.purpose || "Meeting"), 20, currentY + 30);
    doc.text("Date: " + formattedDate, 20, currentY + 45)

    //qr code
    if(qrData && qrData.includes("base64,")){
      const base64Data = qrData.split("base64,")[1];
      const qrBuffer = Buffer.from(base64Data, "base64");

      doc.image(qrBuffer, 90, 220, { width: 80 });
    } 
    else{
      doc.text("QR Code Not Available", 20, 250, {align: "center"});
    }

    //border
    doc.rect(5, 5, 288, 410).stroke("#2c3e50");

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => resolve(finalPath));
      writeStream.on("error", (err) => reject(err));
    });

  } 
  catch(error){
    console.error("pdf generate error", error.message);
    throw error;
  }
}

module.exports = generatePass;
