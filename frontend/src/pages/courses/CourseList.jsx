import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('コース一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('このコースを削除してもよろしいですか？')) {
      try {
        await courseService.delete(id);
        toast.success('削除しました');
        fetchCourses();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = activeOnly ? c.is_active : true;
    return matchesSearch && matchesActive;
  });

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
            コース管理
          </h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <div className="d-flex gap-2">
                <div className="flex-grow-1">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="コース名またはコードで検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn btn-primary px-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#0b5ed7', border: 'none' }}>
                  <i className="bi bi-search"></i>
                  <span>検索</span>
                </button>
                <button className="btn btn-outline-secondary px-4 d-flex align-items-center gap-2" onClick={() => { setSearchTerm(''); setActiveOnly(false); }}>
                  <i className="bi bi-arrow-repeat"></i>
                  <span>リフレッシュ</span>
                </button>
              </div>
              <div className="mt-3">
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    checked={activeOnly}
                    onChange={(e) => setActiveOnly(e.target.checked)}
                    id="activeOnly"
                  />
                  <label className="form-check-label small fw-medium text-muted" htmlFor="activeOnly">
                    アクティブのみ表示
                  </label>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="d-flex justify-content-md-end">
                <button className="btn btn-success px-4 py-2 d-flex align-items-center gap-2" 
                  onClick={() => navigate('/courses/new')}
                  style={{ backgroundColor: '#198754', border: 'none' }}>
                  <i className="bi bi-plus-circle"></i>
                  <span>新規追加</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-center py-3" style={{ width: '60px', background: '#0b5ed7', color: 'white' }}>ID</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>コースコード</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>コース名</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>単位数</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>担当教師</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>ステータス</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>登録日</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">コースが登録されていません。</td>
                  </tr>
                ) : (
                  filteredCourses.map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}>
                      <td className="text-center">{c.id}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill fw-medium">
                          {c.course_code}
                        </span>
                      </td>
                      <td className="fw-medium">{c.course_name}</td>
                      <td className="text-center">{c.credits}</td>
                      <td>{c.teacher_name || <span className="text-muted fst-italic">未割当</span>}</td>
                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill fw-medium ${
                          c.is_active ? 'bg-success text-white' : 'bg-danger text-white'
                        }`}>
                          {c.is_active ? 'アクティブ' : '非アクティブ'}
                        </span>
                      </td>
                      <td className="text-center small text-muted">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button className="border-0 bg-transparent text-info p-0" title="詳細"
                            onClick={(e) => { e.stopPropagation(); navigate(`/courses/${c.id}`); }}>
                            <i className="bi bi-info-circle" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-primary p-0" title="編集"
                            onClick={(e) => { e.stopPropagation(); navigate(`/courses/${c.id}/edit`); }}>
                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <Link to={`/enrollments/new?courseId=${c.id}`} className="text-decoration-none text-success" 
                            title="受講生徒を登録" onClick={(e) => e.stopPropagation()}>
                            <i className="bi bi-person-plus-fill" style={{ fontSize: '1.2rem' }}></i>
                          </Link>
                          <button className="border-0 bg-transparent text-danger p-0" title="削除"
                            onClick={(e) => handleDelete(e, c.id)}>
                            <i className="bi bi-trash-fill" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
