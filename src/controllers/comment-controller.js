
import Comment from "../model/Comment.js";

export const updateComment =  async (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;
    try {
    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this comment" });
    }

    // Update the comment content
    comment.content = content;
    await comment.save();

    // Return the updated comment
    return res.status(200).json({ comment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
  };