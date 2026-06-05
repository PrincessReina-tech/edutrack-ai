import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function CourseManagement({ onClose }) {
  const [courses, setCourses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_name: '',
    credit_hours: ''
  });
const [editingCourse, setEditingCourse] = useState(null);
const [saving, setSaving] = useState(false);
const [deletingId, setDeletingId] = useState(null);

const [confirmModal, setConfirmModal] = useState({
  open: false,
  courseId: null,
});

  const token = localStorage.getItem('token');
  const headers = { authorization: `Bearer ${token}` };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        'https://edutrack-ai-production-502d.up.railway.app/api/admin/courses',
        { headers }
      );

      // FIX: ensure array always
      const data =
        res.data?.data ||
        res.data?.results ||
        res.data ||
        [];

      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch courses error:', err);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

const addCourse = async () => {
  try {
    setSaving(true);

    if (editingCourse) {
      await axios.put(
        `https://edutrack-ai-production-502d.up.railway.app/api/admin/courses/${editingCourse.id}`,
        newCourse,
        { headers }
      );
      toast.success('Course updated successfully');
    } else {
      await axios.post(
        'https://edutrack-ai-production-502d.up.railway.app/api/admin/courses',
        newCourse,
        { headers }
      );
      toast.success('Course added successfully');
    }

    setShowAddModal(false);
    setEditingCourse(null);

    setNewCourse({
      course_code: '',
      course_name: '',
      credit_hours: ''
    });

    fetchCourses();

  } catch (err) {
    console.error(err);
    toast.error('Failed to save course');
  } finally {
    setSaving(false);
  }
};

  const deleteCourse = (id) => {
  setConfirmModal({
    open: true,
    courseId: id,
  });
};
 const confirmDeleteCourse = async () => {
  try {
    setDeletingId(confirmModal.courseId);

    await axios.delete(
      `https://edutrack-ai-production-502d.up.railway.app/api/admin/courses/${confirmModal.courseId}`,
      { headers }
    );

    toast.success('Course deleted successfully');
    fetchCourses();

  } catch (err) {
    console.error(err);
    toast.error('Failed to delete course');
  } finally {
    setDeletingId(null);
    setConfirmModal({ open: false, courseId: null });
  }
};

const Spinner = () => (
  <span style={{
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite'
  }} />
);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

          {/* HEADER */}
          <div style={styles.header}>
            
          <h2 style={styles.title}>Course Management</h2>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
              ➕ Add Course
            </button>

            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
          </div>

           {/* COURSE LIST */}
         <div style={styles.list}>
          {courses.length === 0 ? (
            <p style={{ color: '#aaa' }}>No courses found</p>
          ) : (
            courses.map((c) => (
              <div key={c.id} style={styles.row}>
                <div>
                  <b>{c.course_code}</b> — {c.course_name}
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>
                    {c.credit_hours} credit hours
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
          <button
           style={styles.editBtn}
          onClick={() => {
          setEditingCourse(c);

          setNewCourse({
          course_code: c.course_code,
          course_name: c.course_name,
          credit_hours: c.credit_hours
           });

          setShowAddModal(true);
         }}>
          Edit
           </button>

          <button
           style={{
          ...styles.deleteBtn,
          opacity: deletingId === c.id ? 0.6 : 1,
          cursor: deletingId === c.id ? 'not-allowed' : 'pointer'
          }}
          onClick={() => deleteCourse(c.id)}
           disabled={deletingId === c.id}>
          {deletingId === c.id ? <Spinner /> : 'Delete'}
          </button>
          </div>
              </div>
            ))
          )}
          </div>

             {/* ADD COURSE MODAL */}
             {showAddModal && (
          <div style={styles.innerOverlay}>
            <div style={styles.innerModal}>
             <h3>
            {editingCourse ? 'Edit Course' : 'Add Course'}
          </h3>

              <input
                placeholder="Course Code"
                value={newCourse.course_code}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, course_code: e.target.value })
                }
                style={styles.input}
              />

              <input
                placeholder="Course Name"
                value={newCourse.course_name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, course_name: e.target.value })
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Credit Hours"
                value={newCourse.credit_hours}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, credit_hours: e.target.value })
                }
                style={styles.input}
              />

              <button
          style={{
         ...styles.saveBtn,
          opacity: saving ? 0.6 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
          alignItems: 'center',
         justifyContent: 'center',
          gap: '8px'
         }}
           onClick={addCourse}
          disabled={saving}>
           {saving ? (
            <>
           <Spinner /> Saving...
          </>
          ) : (
          editingCourse ? 'Update Course' : 'Save'
           )}
           </button>

              <button
                style={styles.cancelBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
           )}
{confirmModal.open && (
  <div style={styles.innerOverlay}>
    <div style={{
      ...styles.innerModal,
      textAlign: 'center',
      padding: '25px'
    }}>

      <h3 style={{ color: '#fff' }}>Confirm Delete</h3>

      <p style={{ color: 'rgba(255,255,255,0.6)' }}>
        Are you sure you want to delete this course?
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>

        <button
          style={styles.cancelBtn}
          onClick={() =>
            setConfirmModal({ open: false, courseId: null })
          }
        >
          Cancel
        </button>

        <button
          style={{
            ...styles.deleteBtn,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onClick={confirmDeleteCourse}>
          {deletingId === confirmModal.courseId ? (
            <>
              <Spinner /> Deleting...
            </>
          ) : (
            'Yes, Delete'
          )}
          </button>

          </div>
          </div>
          </div>
          )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  modal: {
    width: '600px',
    maxWidth: '95%',
    background: '#0f0f1f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px',
    color: '#fff',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  title: {
    margin: 0,
    fontSize: '18px',
  },

  closeBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: '50px',
    padding: '6px 10px',
    cursor: 'pointer',
  },

  addBtn: {
    background: 'linear-gradient(90deg,#185FA5,#0F9B8E)',
    border: 'none',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '50px',
    cursor: 'pointer',
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto',
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
  },

  deleteBtn: {
    background: 'rgba(163,45,45,0.2)',
    border: '1px solid rgba(163,45,45,0.4)',
    color: '#ff6b6b',
    borderRadius: '50px',
    padding: '5px 10px',
    cursor: 'pointer',
  },

  innerOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerModal: {
    background: '#1a1a2e',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '300px',
  },

  input: {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
  },

  saveBtn: {
    background: '#0F9B8E',
    border: 'none',
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  cancelBtn: {
    background: 'gray',
    border: 'none',
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  editBtn: {
  background: 'rgba(15,155,142,0.2)',
  border: '1px solid rgba(15,155,142,0.4)',
  color: '#0F9B8E',
  borderRadius: '50px',
  padding: '5px 10px',
  cursor: 'pointer',
},



};

export default CourseManagement;