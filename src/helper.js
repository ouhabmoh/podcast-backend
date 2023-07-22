import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: 'dhf83aynm',
  api_key: '627166155442222',
  api_secret: 'IH6CCMY7w3sU2V8u9kWXiyPN6gk',
});
export default async function handleUpload(file) {
    const res = await cloudinary.v2.uploader.upload(file, {
      timeout: 12000000, // Set the timeout option here
      resource_type: "auto",
    });
    return res;
  }
  
