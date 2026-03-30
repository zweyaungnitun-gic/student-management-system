import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          {/* Mobile Sidebar Toggle (Placeholder for layout integration) */}
          <button className="btn btn-light btn-icon d-lg-none" type="button" aria-label="Toggle sidebar">
            <i className="bi bi-list fs-4"></i>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              生徒情報管理システム (Student Information System)
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        {/* Total Students */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-people-fill fs-2 text-primary"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">総生徒数 (Total Students)</h6>
                  <h3 className="mb-0 fw-bold">1,248</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person-workspace fs-2 text-success"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">総教師数 (Total Teachers)</h6>
                  <h3 className="mb-0 fw-bold">45</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-book-fill fs-2 text-info"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">総コース数 (Total Courses)</h6>
                  <h3 className="mb-0 fw-bold">32</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person-badge-fill fs-2 text-warning"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">総ユーザー数 (Total Users)</h6>
                  <h3 className="mb-0 fw-bold">18</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-6">
          {/* Recent Students */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                最近登録された生徒 (Recently Registered)
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">山田 太郎 (Yamada Taro)</h6>
                    <small className="text-muted">ST-001</small>
                  </div>
                  <span className="badge bg-primary rounded-pill">在校</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">鈴木 花子 (Suzuki Hanako)</h6>
                    <small className="text-muted">ST-002</small>
                  </div>
                  <span className="badge bg-primary rounded-pill">在校</span>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white text-end">
              <Link to="/students" className="btn btn-sm btn-outline-primary">
                すべての生徒を見る (View All) <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          {/* Recent Accepted Registrations */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-check2-circle me-2 text-success"></i>
                最近承認された登録申請
              </h5>
              <Link to="/registrations" className="btn btn-sm btn-outline-success">
                すべて見る
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <Link to="/registrations/1" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Aung Ko Ko</h6>
                    <small className="text-muted">
                      <span>REG-2024-001</span>
                    </small>
                  </div>
                  <span className="badge bg-success rounded-pill">ACCEPTED</span>
                </Link>
                <Link to="/registrations/2" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Ma Thandar</h6>
                    <small className="text-muted">
                      <span>REG-2024-002</span>
                    </small>
                  </div>
                  <span className="badge bg-success rounded-pill">ACCEPTED</span>
                </Link>
              </div>
            </div>
            <div className="card-footer bg-white text-end">
              <Link to="/registrations" className="btn btn-sm btn-outline-primary">
                PENDING申請を見る <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-6">
          {/* 3 Report Cards Row */}
          <div className="row g-4 report-cards-row mb-4">
            {/* Grade Summary Card */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-bar-chart-line fs-1 text-primary mb-3"></i>
                  <h6 className="card-title fw-bold mb-2">成績サマリー</h6>
                  <p className="card-text text-muted small mb-3">学生ごとの成績サマリーを表示</p>
                  <input type="text" className="form-control form-control-sm mb-2" placeholder="Student ID" />
                  <button className="btn btn-sm btn-primary w-100">表示 (Show)</button>
                </div>
              </div>
            </div>

            {/* Report Card */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-file-text fs-1 text-success mb-3"></i>
                  <h6 className="card-title fw-bold mb-2">成績表</h6>
                  <p className="card-text text-muted small mb-3">PDF形式の成績表を表示</p>
                  <input type="text" className="form-control form-control-sm mb-2" placeholder="Student ID" />
                  <button className="btn btn-sm btn-success w-100">表示 (Show)</button>
                </div>
              </div>
            </div>

            {/* Class Rankings */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <i className="bi bi-trophy fs-1 text-warning mb-3"></i>
                  <h6 className="card-title fw-bold mb-2">クラス順位</h6>
                  <p className="card-text text-muted small mb-3">クラス内の順位を表示</p>
                  <select className="form-select form-select-sm mb-2">
                    <option value="N5">N5クラス</option>
                    <option value="N4">N4クラス</option>
                    <option value="N3">N3クラス</option>
                  </select>
                  <button className="btn btn-sm btn-warning w-100">表示 (Show)</button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Courses */}
          <div className="card border-0 shadow-sm dashboard-card mt-4">
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">
                <i className="bi bi-bookmark-star me-2 text-success"></i>
                アクティブなコース (Active Courses)
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Japanese N5</h6>
                    <small className="text-muted">JPN-N5</small>
                  </div>
                  <span className="badge bg-success rounded-pill">
                    <span>4</span> 単位 (Credits)
                  </span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Japanese N4</h6>
                    <small className="text-muted">JPN-N4</small>
                  </div>
                  <span className="badge bg-success rounded-pill">
                    <span>4</span> 単位 (Credits)
                  </span>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white text-end">
              <Link to="/courses" className="btn btn-sm btn-outline-success">
                すべてのコースを見る (View All) <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">
                <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
                クイックアクション (Quick Actions)
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col">
                  <Link to="/students/new" className="text-decoration-none">
                    <div className="text-center p-3 border rounded bg-light">
                      <i className="bi bi-person-plus-fill fs-2 text-primary mb-2"></i>
                      <h6 className="mb-0 text-dark">新規生徒登録</h6>
                    </div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/registrations" className="text-decoration-none">
                    <div className="text-center p-3 border rounded bg-light position-relative">
                      <i className="bi bi-inbox fs-2 text-primary mb-2"></i>
                      <h6 className="mb-0 text-dark">登録申請管理</h6>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        2
                      </span>
                    </div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/teachers/new" className="text-decoration-none">
                    <div className="text-center p-3 border rounded bg-light">
                      <i className="bi bi-person-plus-fill fs-2 text-success mb-2"></i>
                      <h6 className="mb-0 text-dark">新規教師追加</h6>
                    </div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/courses/new" className="text-decoration-none">
                    <div className="text-center p-3 border rounded bg-light">
                      <i className="bi bi-journal-plus fs-2 text-info mb-2"></i>
                      <h6 className="mb-0 text-dark">新規コース追加</h6>
                    </div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/users/new" className="text-decoration-none">
                    <div className="text-center p-3 border rounded bg-light">
                      <i className="bi bi-person-badge-fill fs-2 text-warning mb-2"></i>
                      <h6 className="mb-0 text-dark">新規ユーザー追加</h6>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
