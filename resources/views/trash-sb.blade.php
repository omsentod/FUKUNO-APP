@extends('layouts.nav-side')

@section('title', 'Trash') 

@endsection

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/task.css') }}">
@endpush

@push('scripts')
    <script src="{{ asset('js/task.js') }}"></script>
@endpush