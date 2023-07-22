import Info from "../model/Info.js";
import handleUpload from "../helper.js";
export const getInfo = async (req, res) => {
    
  
    try {
      // Find the Info document by ID
      const info = await Info.findOne();
  
      if (!info) {
       const defaultInfo =  await Info.create({
            description1: "Default Description",
            description2: "Default Description 2",
            image: "default_image.jpg",
            name: "Default Name",
            address: "Default Address",
            title: "Default Title",
            description3: "Default Description 3",
            description4: "Default Description 4",
            image2: "default_image2.jpg",
          });
        return  res.status(200).json({defaultInfo});
       
      }
  
      res.status(200).json({info});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

export const updateInfo = async (req, res) => {
  const infoId = req.params.id;
  const updates = req.body;
  console.log(updates);

  try {
    // Verify and validate the updates
    const allowedUpdates = [
      "description1",
      "description2",
      "image",
      "name",
      "address",
      "title",
      "description3",
      "description4",
      "image2",
    ];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates" });
    }

    // Find the Info document by ID
    const info = await Info.findOne();


    if (!info) {
      return res.status(404).json({ error: "Info not found" });
    }

    // If there are any image updates, handle them separately
    if (req.files) {
      if (req.files["image"]) {
        if(req.files['image']){
            try {
             
                    // console.log(url);
                const   b64 = Buffer.from(req.files['image'][0].buffer).toString("base64");
                const    dataURI = "data:" + req.files['image'][0].mimetype + ";base64," + b64;
                const    cldRes = await handleUpload(dataURI);
                  // const url =  await cloudinary.url(cldRes.asset_id, {streaming_profile: "auto", resource_type: "audio"})
                    console.log(cldRes);
                    updates.image = cldRes.secure_url   
                } catch (error) {
                  console.log("bbbb")
                  console.log(error);
                  res.send({
                    message: error.message,
                  });
                }
            console.log(updates.image);
    
          }
        console.log(updates.image);
      }
      if (req.files["image2"]) {
        if(req.files['image2']){
            try {
             
                    // console.log(url);
                const   b64 = Buffer.from(req.files['image2'][0].buffer).toString("base64");
                const    dataURI = "data:" + req.files['image2'][0].mimetype + ";base64," + b64;
                const    cldRes = await handleUpload(dataURI);
                  // const url =  await cloudinary.url(cldRes.asset_id, {streaming_profile: "auto", resource_type: "audio"})
                    console.log(cldRes);
                    updates.image2 = cldRes.secure_url   
                } catch (error) {
                  console.log("bbbb")
                  console.log(error);
                  res.send({
                    message: error.message,
                  });
                }
            console.log(updates.image2);
    
          }
        console.log(updates.image2);
      }
    }

    // Apply updates to the Info document
    Object.assign(info, updates);

    // Save the updated Info document
    const updatedInfo = await info.save();

    res.json(updatedInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
