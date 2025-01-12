import os
from ultralytics import YOLO
from PIL import Image

# Load YOLOv8 model once
model = YOLO('models/best.pt')  # Ensure best.pt is placed in server/models/

def process_image_yolov8(input_path, output_folder, image_id):
    # Run inference
    results = model(input_path)
    # results is a list of Results objects. We'll use results[0]
    res = results[0]
    
    # Extract segmentation masks and bounding boxes
    # YOLOv8 segmentation results: 
    # res.masks.data -> segmentation masks as a tensor (N, H, W), N=number of detections
    # res.boxes.xyxy -> bounding boxes
    # Pixel area calculation: sum of all mask pixels that are True/1

    # Convert masks to a single combined mask if multiple objects:
    combined_mask = None
    if res.masks is not None and res.masks.data is not None:
        # Each mask: boolean array, combine all
        mask_data = res.masks.data.cpu().numpy()  # shape: [N, H, W]
        combined_mask = (mask_data.sum(axis=0) > 0).astype('uint8')  # combined binary mask
        pixel_area = int(combined_mask.sum())
    else:
        pixel_area = 0

    # Use Ultralytics' built-in functionality to plot results
    output_image_array = res.plot()  # Returns a numpy.ndarray (image with annotations)

    # Convert the numpy array to a PIL.Image
    output_image = Image.fromarray(output_image_array)

    # Save the annotated image
    output_path = os.path.join(output_folder, f"{image_id}.jpg")
    output_image.save(output_path)

    return pixel_area

# import os
# from ultralytics import YOLO
# from PIL import Image, ImageDraw, ImageOps

# # Load YOLOv8 model once
# model = YOLO('models/best.pt')  # Ensure best.pt is placed in server/models/

# def process_image_yolov8(input_path, output_folder, image_id):
#     # Run inference
#     results = model(input_path)
#     # results is a list of Results objects. We'll use results[0]
#     res = results[0]
    
#     # Extract segmentation masks and bounding boxes
#     # YOLOv8 segmentation results: 
#     # res.masks.data -> segmentation masks as a tensor (N, H, W), N=number of detections
#     # res.boxes.xyxy -> bounding boxes
#     # Pixel area calculation: sum of all mask pixels that are True/1

#     # Convert masks to a single combined mask if multiple objects:
#     combined_mask = None
#     if res.masks is not None and res.masks.data is not None:
#         # Each mask: boolean array, combine all
#         mask_data = res.masks.data.cpu().numpy()  # shape: [N, H, W]
#         combined_mask = (mask_data.sum(axis=0) > 0).astype('uint8')  # combined binary mask
#         pixel_area = int(combined_mask.sum())
#     else:
#         pixel_area = 0

#     # Load original image
#     img = Image.open(input_path).convert('RGB')
#     draw = ImageDraw.Draw(img)

#     # Draw bounding boxes
#     if res.boxes is not None:
#         for box in res.boxes.xyxy.cpu().numpy():
#             x1, y1, x2, y2 = box
#             draw.rectangle([x1, y1, x2, y2], outline="red", width=3)

#     # Overlay the segmentation mask with 20% opacity if we have one
#     if combined_mask is not None and pixel_area > 0:
#         # Create a semi-transparent overlay
#         mask_img = Image.fromarray((combined_mask*255).astype('uint8'))
#         # Color the mask (for example, green with 20% opacity)
#         colored_mask = Image.new("RGBA", mask_img.size, (0,255,0, int(255*0.2)))
#         # Apply mask_img as a mask to color
#         # mask_img is binary mask, use it as the alpha channel
#         img = Image.alpha_composite(img.convert("RGBA"), Image.composite(colored_mask, Image.new("RGBA", img.size), mask_img))
#         img = img.convert("RGB")

#     output_path = os.path.join(output_folder, f"{image_id}.jpg")
#     img.save(output_path)

#     return pixel_area
