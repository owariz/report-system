import { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, Button } from 'antd';

const { Dragger } = Upload;

export default function AddJson() {
  const [fileList, setFileList] = useState([]);

  const handleChange = (info) => {
    const { status } = info.file;

    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }

    if (status === 'done') {
      message.success(`${info.file.name} ไฟล์ถูกอัปโหลดเรียบร้อยแล้ว!`);
    } else if (status === 'error') {
      message.error(`${info.file.name} การอัปโหลดไฟล์ล้มเหลว.`);
    }

    setFileList(info.fileList);
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.error("กรุณาเลือกไฟล์ JSON");
      return;
    }

    const reader = new FileReader();

    const processFile = async (file) => {
      // ตรวจสอบว่าไฟล์เป็น JSON หรือไม่
      if (file.type !== 'application/json') {
        message.error(`${file.name} ไม่ใช่ไฟล์ JSON`);
        return;
      }

      reader.onload = async (e) => {
        const jsonData = e.target.result;

        try {
          const studentsData = JSON.parse(jsonData);

          const response = await fetch("http://localhost:4000/api/admin/add/student", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentsData),
          });

          const data = await response.json();

          if (response.ok) {
            message.success(`เพิ่มข้อมูลนักศึกษาในไฟล์ ${file.name} เรียบร้อยแล้ว!`);
          } else {
            message.error(data.message || "เกิดข้อผิดพลาด");
          }
        } catch (error) {
          console.error(error);
          message.error(`เกิดข้อผิดพลาดในการเชื่อมต่อสำหรับไฟล์ ${file.name}`);
        }
      };

      reader.readAsText(file); // อ่านไฟล์เป็น Text
    };

    // ประมวลผลแต่ละไฟล์ใน fileList
    for (const file of fileList.map(f => f.originFileObj)) {
      await processFile(file);
    }

    setFileList([]); // เคลียร์ไฟล์หลังจากอัปโหลดสำเร็จ
  };

  const props = {
    name: 'file',
    multiple: true,
    onChange: handleChange,
    beforeUpload: (file) => {
      // ป้องกันการอัปโหลดอัตโนมัติ
      return false;
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div>
      <h1>เพิ่มไฟล์ JSON</h1>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">คลิกหรือลากไฟล์มาที่พื้นที่นี้เพื่ออัปโหลด</p>
        <p className="ant-upload-hint">
          รองรับการอัปโหลดไฟล์หลายไฟล์
        </p>
      </Dragger>

      <Button type="primary" onClick={handleSubmit} style={{ marginTop: 16 }}>
        อัปโหลด
      </Button>

      {fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <strong>ไฟล์ที่เลือก:</strong>
          <ul>
            {fileList.map(file => (
              <li key={file.uid}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
