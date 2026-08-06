import base64
import cv2
import numpy as np

from insightface.app import FaceAnalysis


class InsightFaceService:

    def __init__(self):

        self.app = FaceAnalysis(name="buffalo_l")

        self.app.prepare(
            ctx_id=-1,
            det_size=(640, 640)
        )

        print("InsightFace Loaded Successfully")

    def image_to_embedding(self, base64_image):

        if "," in base64_image:
            base64_image = base64_image.split(",")[1]

        image_bytes = base64.b64decode(base64_image)

        image_array = np.frombuffer(
            image_bytes,
            np.uint8
        )

        image = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

        faces = self.app.get(image)

        if len(faces) == 0:
            raise Exception("No face detected.")

        if len(faces) > 1:
            raise Exception("Multiple faces detected.")

        return faces[0].embedding.tolist()

    def similarity(self, emb1, emb2):

        emb1 = np.array(emb1)
        emb2 = np.array(emb2)

        return float(

            np.dot(emb1, emb2)

            /

            (

                np.linalg.norm(emb1)

                *

                np.linalg.norm(emb2)

            )

        )


face_service = InsightFaceService()