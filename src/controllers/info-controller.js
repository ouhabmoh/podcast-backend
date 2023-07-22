import Info from "../models/Info.js";

export const getById = async (req, res) => {
    const infoId = req.params.id;
  
    try {
      // Find the Info document by ID
      const info = await Info.findById(infoId);
  
      if (!info) {
        return res.status(404).json({ message: "Info not found" });
      }
  
      res.json(info);
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
      "adress",
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
    const info = await Info.findById(infoId);

    if (!info) {
      return res.status(404).json({ error: "Info not found" });
    }

    // If there are any image updates, handle them separately
    if (req.files) {
      if (req.files["image"]) {
        // The uploaded image file can be accessed through req.files['image']
        updates.image = req.files["image"][0]["path"];
        console.log(updates.image);
      }
      if (req.files["image2"]) {
        // The uploaded image2 file can be accessed through req.files['image2']
        updates.image2 = req.files["image2"][0]["path"];
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
