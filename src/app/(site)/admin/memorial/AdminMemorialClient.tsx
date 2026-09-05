"use client";

type Job = {
  _id: string;
  hallCode: string;
  deceasedName: string;
  plotNo: string;
  requesterName: string;
  status: string;
  note: string;
  staffNote?: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "접수",
  in_progress: "편집 중",
  completed: "완료",
  rejected: "반려",
};

type Props = {
  jobs: Job[];
  updateJobAction: (formData: FormData) => Promise<void>;
  publishVideoAction: (formData: FormData) => Promise<void>;
};

export function AdminMemorialClient({ jobs, updateJobAction, publishVideoAction }: Props) {
  return (
    <div className="admin-memorial">
      <section className="panel">
        <h2>편집 영상 요청 ({jobs.length})</h2>
        {!jobs.length ? (
          <p className="meta">접수된 편집 요청이 없습니다.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table admin-member-table">
              <thead>
                <tr>
                  <th>망자</th>
                  <th>묘역</th>
                  <th>요청자</th>
                  <th>상태</th>
                  <th>요청 내용</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.deceasedName}</td>
                    <td>{job.plotNo}</td>
                    <td>{job.requesterName}</td>
                    <td>{STATUS_LABEL[job.status] || job.status}</td>
                    <td>{job.note}</td>
                    <td>
                      <form action={updateJobAction} className="admin-inline-form">
                        <input type="hidden" name="id" value={job._id} />
                        <select name="status" defaultValue={job.status}>
                          <option value="requested">접수</option>
                          <option value="in_progress">편집 중</option>
                          <option value="completed">완료</option>
                          <option value="rejected">반려</option>
                        </select>
                        <input name="staffNote" placeholder="메모" defaultValue={job.staffNote || ""} />
                        <button type="submit" className="btn btn-sm">
                          저장
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>편집 영상 게시</h2>
        <p className="meta">완성된 추모 영상을 해당 추모관 타임라인에 등록합니다.</p>
        <form action={publishVideoAction} encType="multipart/form-data" className="form-grid memorial-admin-publish">
          <label>
            추모관 코드
            <input name="hallCode" required placeholder="M-A101-..." />
          </label>
          <label>
            제목
            <input name="title" required placeholder="2027년 기일 추모 영상" />
          </label>
          <label>
            설명
            <textarea name="body" rows={2} placeholder="편집 내용 요약" />
          </label>
          <label>
            동영상 파일
            <input name="file" type="file" accept="video/*" required />
          </label>
          <label>
            연결 요청 ID (선택)
            <input name="jobId" placeholder="완료 처리할 요청 ID" />
          </label>
          <button type="submit" className="btn btn-primary">
            영상 게시
          </button>
        </form>
      </section>
    </div>
  );
}
